import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user is admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAdmin } = await supabaseAdmin.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const exportType = url.searchParams.get('type');

    if (exportType === 'schema') {
      const schema = await generateSchema(supabaseAdmin);
      return new Response(schema, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/sql',
          'Content-Disposition': 'attachment; filename="schema.sql"'
        },
      });
    } else if (exportType === 'data') {
      const data = await generateDataSQL(supabaseAdmin);
      return new Response(data, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/sql',
          'Content-Disposition': 'attachment; filename="data.sql"'
        },
      });
    } else if (exportType === 'storage') {
      const storageInfo = await generateStorageInfo(supabaseAdmin);
      return new Response(JSON.stringify(storageInfo, null, 2), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="storage-files.json"'
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid export type' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateSchema(supabase: any): Promise<string> {
  let sql = '-- Database Schema Export\n';
  sql += '-- Generated: ' + new Date().toISOString() + '\n\n';

  // Enum types - hardcoded as we know them
  sql += '-- Enum Types\n';
  sql += "DO $$ BEGIN\n";
  sql += "  CREATE TYPE public.app_role AS ENUM ('admin', 'user');\n";
  sql += "EXCEPTION\n";
  sql += "  WHEN duplicate_object THEN null;\n";
  sql += "END $$;\n\n";

  // Full table definitions with all columns, constraints, and defaults
  const schemaDefs = {
    categories: `CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  display_order integer DEFAULT 0,
  parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  show_in_nav boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  name_en text NOT NULL,
  name_ka text NOT NULL,
  name_ru text,
  description_en text,
  description_ka text,
  description_ru text,
  icon text,
  slug_en text UNIQUE,
  slug_ka text UNIQUE,
  slug_ru text UNIQUE,
  path_en text,
  path_ka text,
  path_ru text,
  banner_image_url text
);`,
    
    products: `CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  is_featured boolean DEFAULT false,
  name_en text NOT NULL,
  name_ka text NOT NULL,
  name_ru text,
  description_en text,
  description_ka text,
  description_ru text,
  slug_en text UNIQUE,
  slug_ka text UNIQUE,
  slug_ru text UNIQUE,
  image_url text,
  gallery_image_urls jsonb,
  video_url text,
  video_description_en text,
  video_description_ka text,
  video_description_ru text,
  specs_en jsonb,
  specs_ka jsonb,
  specs_ru jsonb,
  additional_info_en text,
  additional_info_ka text,
  additional_info_ru text,
  price numeric,
  related_product_ids jsonb DEFAULT '[]'::jsonb
);`,
    
    product_categories: `CREATE TABLE public.product_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(product_id, category_id)
);`,
    
    blogs: `CREATE TABLE public.blogs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  publish_date date DEFAULT CURRENT_DATE,
  is_published boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  title_en text NOT NULL,
  title_ka text NOT NULL,
  title_ru text,
  slug_en text UNIQUE,
  slug_ka text UNIQUE,
  slug_ru text UNIQUE,
  excerpt_en text,
  excerpt_ka text,
  excerpt_ru text,
  content_en text,
  content_ka text,
  content_ru text,
  featured_image_url text,
  gallery_image_urls jsonb DEFAULT '[]'::jsonb,
  author text,
  tags jsonb DEFAULT '[]'::jsonb,
  meta_title_en text,
  meta_title_ka text,
  meta_title_ru text,
  meta_description_en text,
  meta_description_ka text,
  meta_description_ru text
);`,
    
    success_stories: `CREATE TABLE public.success_stories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  publish_date date DEFAULT CURRENT_DATE,
  is_published boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  title_en text NOT NULL,
  title_ka text NOT NULL,
  title_ru text,
  slug_en text UNIQUE,
  slug_ka text UNIQUE,
  slug_ru text UNIQUE,
  excerpt_en text,
  excerpt_ka text,
  excerpt_ru text,
  content_en text,
  content_ka text,
  content_ru text,
  featured_image_url text,
  gallery_image_urls jsonb DEFAULT '[]'::jsonb,
  customer_name_en text,
  customer_name_ka text,
  customer_name_ru text,
  customer_location_en text,
  customer_location_ka text,
  customer_location_ru text,
  customer_company text,
  customer_testimonial_en text,
  customer_testimonial_ka text,
  customer_testimonial_ru text,
  product_ids jsonb DEFAULT '[]'::jsonb,
  results_achieved jsonb DEFAULT '[]'::jsonb,
  meta_title_en text,
  meta_title_ka text,
  meta_title_ru text,
  meta_description_en text,
  meta_description_ka text,
  meta_description_ru text
);`,
    
    team_members: `CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  display_order integer DEFAULT 0,
  name_en text NOT NULL,
  name_ka text NOT NULL,
  name_ru text,
  position_en text NOT NULL,
  position_ka text NOT NULL,
  position_ru text,
  image_url text,
  email text,
  phone text
);`,
    
    contact_submissions: `CREATE TABLE public.contact_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  category text,
  message text NOT NULL,
  status text DEFAULT 'new'
);`,
    
    user_roles: `CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);`
  };

  // Output table definitions
  sql += '\n-- Tables (will be created if they do not exist)\n';
  sql += '-- Note: Run this on a fresh database or manually drop existing tables first\n\n';
  
  for (const [tableName, tableDef] of Object.entries(schemaDefs)) {
    sql += `\n-- Table: ${tableName}\n`;
    sql += `DROP TABLE IF EXISTS public.${tableName} CASCADE;\n`;
    sql += tableDef + '\n';
    sql += `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;\n`;
  }

  // RLS Policies
  sql += '\n-- Row Level Security Policies\n\n';
  
  sql += `-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Product categories policies
CREATE POLICY "Product categories are viewable by everyone" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert product categories" ON public.product_categories FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update product categories" ON public.product_categories FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete product categories" ON public.product_categories FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Blogs policies
CREATE POLICY "Public can view published blogs" ON public.blogs FOR SELECT USING (is_published = true);
CREATE POLICY "Admins have full access to blogs" ON public.blogs FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Success stories policies
CREATE POLICY "Public can view published success stories" ON public.success_stories FOR SELECT USING (is_published = true);
CREATE POLICY "Admins have full access to success stories" ON public.success_stories FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Team members policies
CREATE POLICY "Team members are viewable by everyone" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Admins can insert team members" ON public.team_members FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update team members" ON public.team_members FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete team members" ON public.team_members FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Contact submissions policies
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all contact submissions" ON public.contact_submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete contact submissions" ON public.contact_submissions FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Deny non-admin authenticated SELECT on contact_submissions" ON public.contact_submissions FOR SELECT USING (false);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can insert user roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update user roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete user roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));
`;

  // Functions
  sql += '\n-- Functions\n\n';
  
  sql += `CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_blogs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_success_stories_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
`;

  // Triggers
  sql += '\n-- Triggers\n\n';
  sql += `CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON public.blogs FOR EACH ROW EXECUTE FUNCTION public.handle_blogs_updated_at();
CREATE TRIGGER update_success_stories_updated_at BEFORE UPDATE ON public.success_stories FOR EACH ROW EXECUTE FUNCTION public.handle_success_stories_updated_at();
`;

  return sql;
}

async function generateDataSQL(supabase: any): Promise<string> {
  let sql = '-- Data Export\n';
  sql += '-- Generated: ' + new Date().toISOString() + '\n\n';
  sql += '-- Temporarily disable triggers for faster import\n';
  sql += 'SET session_replication_role = replica;\n\n';

  const tables = [
    'categories',
    'products', 
    'product_categories',
    'team_members',
    'blogs',
    'success_stories',
    'contact_submissions'
  ];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    
    if (error) {
      sql += `-- Error fetching ${table}: ${error.message}\n\n`;
      continue;
    }

    if (!data || data.length === 0) {
      sql += `-- No data in ${table}\n\n`;
      continue;
    }

    sql += `-- Table: ${table}\n`;
    
    // Special handling for categories to respect parent_id foreign key
    let rows = data;
    if (table === 'categories') {
      // Sort categories: NULL parent_id first, then by parent_id
      rows = data.sort((a: any, b: any) => {
        if (a.parent_id === null && b.parent_id === null) return 0;
        if (a.parent_id === null) return -1;
        if (b.parent_id === null) return 1;
        return 0;
      });
    }
    
    for (const row of rows) {
      const columns = Object.keys(row);
      const values = Object.values(row).map(v => {
        if (v === null) return 'NULL';
        if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
        if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
        return v;
      });

      sql += `INSERT INTO public.${table} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';
  }

  sql += '-- Re-enable triggers\n';
  sql += 'SET session_replication_role = DEFAULT;\n';

  return sql;
}

async function listAllFiles(supabase: any, bucket: string, folder = ''): Promise<any[]> {
  const allFiles: any[] = [];
  
  const { data: items, error } = await supabase.storage.from(bucket).list(folder, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' }
  });

  if (error || !items) return allFiles;

  for (const item of items) {
    const itemPath = folder ? `${folder}/${item.name}` : item.name;
    
    if (item.id) {
      // It's a file
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(itemPath);
      allFiles.push({
        path: itemPath,
        name: item.name,
        size: item.metadata?.size,
        contentType: item.metadata?.mimetype,
        url: urlData.publicUrl,
        lastModified: item.updated_at || item.created_at
      });
    } else {
      // It's a folder, recurse into it
      const subFiles = await listAllFiles(supabase, bucket, itemPath);
      allFiles.push(...subFiles);
    }
  }

  return allFiles;
}

async function generateStorageInfo(supabase: any) {
  const buckets = ['assets'];
  const result: any = { 
    buckets: {},
    exportDate: new Date().toISOString(),
    instructions: 'Use the provided URLs to download images. Preserve the "path" structure when saving locally.'
  };

  for (const bucket of buckets) {
    const fileList = await listAllFiles(supabase, bucket);
    
    result.buckets[bucket] = { 
      files: fileList, 
      count: fileList.length,
      totalSize: fileList.reduce((sum, f) => sum + (f.size || 0), 0)
    };
  }

  return result;
}
