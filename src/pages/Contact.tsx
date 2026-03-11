"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { useCreateContactSubmission } from "@/hooks/useContactSubmissions";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { getBaseUrl } from "@/utils/config";

// Validation schema for contact form with security constraints
const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-ZႠ-ჿ\s'-]+$/, "Name contains invalid characters"),
  phone: z
    .string()
    .min(8, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^[\d\s+()-]+$/, "Phone number contains invalid characters"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email is too long")
    .optional()
    .or(z.literal("")),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category is too long"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { language, t } = useLanguage();
  const submitContact = useCreateContactSubmission();
  const { toast } = useToast();

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    phone: "",
    email: "",
    category: language === "en" || language === "hy" || language === "ru" ? "Vineyard Equipment" : "ვენახის ტექნიკა",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  // Update default category when language changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      category: language === "en" || language === "hy" || language === "ru" ? "Vineyard Equipment" : "ვენახის ტექნიკა"
    }));
  }, [language]);

  // SEO metadata
  const contactPath = language === "en" ? "/en/contact" : language === "ru" ? "/ru/contact" : language === "hy" ? "/hy/contact" : "/contact";
  const seoTitle = language === "en" ? "Contact AGROIT" : "AGROIT - კონტაქტი";
  const seoDescription = language === "en"
    ? "Get in touch with AGROIT for Italian agricultural equipment in Georgia. Contact us for vineyard machinery, orchard equipment, and expert agricultural solutions."
    : "დაგვიკავშირდით AGROIT-თან იტალიური აგროტექნიკისთვის საქართველოში. დაგვიკავშირდით ვენახის ტექნიკის, ბაღის აღჭურვილობისა და ექსპერტული აგრარული გადაწყვეტილებებისთვის.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const validation = contactFormSchema.safeParse(formData);

    if (!validation.success) {
      // Extract validation errors
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
        }
      });
      setErrors(fieldErrors);

      toast({
        title: t("ვალიდაციის შეცდომა", "Validation Error", undefined, "Վալիդացիայի սխալ"),
        description:
          language === "en"
            ? "Please check your input and try again."
            : "გთხოვთ შეამოწმოთ თქვენი შეყვანა და სცადოთ თავიდან.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Sanitize data before submission (trim whitespace)
      const sanitizedData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || "",
        category: formData.category.trim(),
        message: formData.message.trim(),
      };

      await submitContact.mutateAsync(sanitizedData);

      const message =
        language === "en"
          ? "Thank you! We will contact you soon."
          : "გმადლობთ! ჩვენ მალე დაგიკავშირდებით.";

      toast({
        title: t("წარმატება", "Success", undefined, "Հաջողություն"),
        description: message,
      });

      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        category: language === "en" || language === "hy" || language === "ru" ? "Vineyard Equipment" : "ვენახის ტექნიკა",
        message: "",
      });
      setErrors({});
    } catch (error) {
      toast({
        title: t("შეცდომა", "Error", undefined, "Սխալ"),
        description:
          language === "en"
            ? "Failed to submit form. Please try again."
            : "ფორმის გაგზავნა ვერ მოხერხდა. გთხოვთ სცადოთ თავიდან.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        path={contactPath}
        image={`${getBaseUrl()}/og-contact.jpg`}
        type="website"
      />
      <main className="bg-background pb-24">
        {/* Breadcrumbs */}
        <div className="bg-muted py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link href={language === "en" ? "/en" : language === "ru" ? "/ru" : language === "hy" ? "/hy" : "/"} className="hover:text-foreground transition-fast">
                {t("მთავარი", "Home", undefined, "Գլխավոր")}
              </Link>
              <span>/</span>
              <span className="text-foreground">
                {t("კონტაქტი", "Contact", undefined, "Կապ")}
              </span>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">
              {t("დაგვიკავშირდით", "Get in Touch", undefined, "Կապվեք մեզ")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {language === "en"
                ? "Write us your question or request a consultation. Our team is ready to help you."
                : "მოგვწერეთ თქვენი კითხვა ან მოითხოვეთ კონსულტაცია. ჩვენი გუნდი მზადაა დაგეხმაროთ."}
            </p>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">{t("შეავსეთ ფორმა", "Fill out the form", undefined, "Լրացրեք ձևը")}</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("სახელი და გვარი", "Name and Surname", undefined, "Անուն ազգանուն")} *</label>
                      <Input
                        required
                        placeholder={t("თქვენი სახელი", "Your name", undefined, "Ձեր անունը")}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("ტელეფონი", "Phone", undefined, "Հեռախոս")} *</label>
                      <Input
                        required
                        type="tel"
                        placeholder="+995 568 84 60 24"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("ელ. ფოსტა", "Email", undefined, "Էլ. փոստ")}</label>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("კატეგორია", "Category", undefined, "Կատեգորիա")}</label>
                      <select
                        className={`w-full p-2 border border-input rounded-md bg-background ${errors.category ? "border-red-500" : ""}`}
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value={language === "en" || language === "hy" || language === "ru" ? "Vineyard Equipment" : "ვენახის ტექნიკა"}>
                          {t("ვენახის ტექნიკა", "Vineyard Equipment", undefined, "Այգեգործների սարքավորումներ")}
                        </option>
                        <option value={language === "en" || language === "hy" || language === "ru" ? "Orchard Equipment" : "ხეხილის ტექნიკა"}>
                          {t("ხეხილის ტექნიკა", "Orchard Equipment", undefined, "Պտղատուների սարքավորումներ")}
                        </option>
                        <option value={language === "en" || language === "hy" || language === "ru" ? "Nuts" : "კაკლოვანი"}>
                          {t("კაკლოვანი", "Nuts", undefined, "Ընկուզային")}
                        </option>
                        <option value={language === "en" || language === "hy" || language === "ru" ? "Service" : "სერვისი"}>
                          {t("სერვისი", "Service", undefined, "Սպասարկում")}
                        </option>
                        <option value={language === "en" || language === "hy" || language === "ru" ? "Other" : "სხვა"}>
                          {t("სხვა", "Other", undefined, "Այլ")}
                        </option>
                      </select>
                      {errors.category && (
                        <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("შეტყობინება", "Message", undefined, "Հաղորդագրություն")} *</label>
                      <Textarea
                        required
                        placeholder={t("დაწერეთ თქვენი შეკითხვა აქ...", "Write your question here...", undefined, "Գրեք ձեր հարցը այստեղ...")}
                        className={`min-h-32 ${errors.message ? "border-red-500" : ""}`}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        maxLength={2000}
                      />
                      {errors.message && (
                        <p className="text-sm text-red-500 mt-1">{errors.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.message.length}/2000 {t("სიმბოლო", "characters", undefined, "նիշ")}
                      </p>
                    </div>
                    
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={submitContact.isPending}
                    >
                      {submitContact.isPending ? t("იგზავნება...", "Sending...", undefined, "Ուղարկվում է...") : t("გაგზავნა", "Send", undefined, "Ուղարկել")}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                        <Phone className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{t("ტელეფონი", "Phone", undefined, "Հեռախոս")}</h3>
                        <div className="text-muted-foreground space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-foreground">
                              {t("ინგლისურენოვანი მხარდაჭერა", "English support", undefined, "Անգլերեն աջակցություն")}
                            </span>
                            <span className="text-muted-foreground/70">-</span>
                            <a
                              href="tel:+393343322743"
                              className="font-semibold text-foreground hover:text-primary transition-colors whitespace-nowrap"
                            >
                              +39 334 332 2743
                            </a>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-foreground">
                              {t("ქართულენოვანი მხარდაჭერა", "Georgian support", undefined, "Վրացական աջակցություն")}
                            </span>
                            <span className="text-muted-foreground/70">-</span>
                            <a
                              href="tel:+995568846024"
                              className="font-semibold text-foreground hover:text-primary transition-colors whitespace-nowrap"
                            >
                              +995 568 84 60 24
                            </a>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{t("ორშ-შაბ: 9:00-18:00", "Mon-Fri: 9:00-18:00", undefined, "Երկ-Ուրբ: 9:00-18:00")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{t("ელ. ფოსტა", "Email", undefined, "Էլ. փոստ")}</h3>
                        <p className="text-muted-foreground">mario.marzano@agroit.ge</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{t("მისამართი", "Address", undefined, "Հասցե")}</h3>
                        <p className="text-muted-foreground">{t("თბილისი, საქართველო", "Tbilisi, Georgia", undefined, "Թբիլիսի, Վրաստան")}</p>
                        <p className="text-muted-foreground">{t("შოურუმი და სერვის ცენტრი", "Showroom and Service Center", undefined, "Ցուցադրասրահ և սպասարկման կենտրոն")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{t("სამუშაო საათები", "Business Hours", undefined, "Աշխատանքային ժամեր")}</h3>
                        <p className="text-muted-foreground">{t("ორშაბათი - შაბათი", "Monday - Saturday", undefined, "Երկուշաբթի - Շաբաթ")}</p>
                        <p className="text-muted-foreground">9:00 - 18:00</p>
                        <p className="text-sm text-primary mt-2">{t("24/7 გადაუდებელი მხარდაჭერა", "24/7 Emergency Support", undefined, "24/7 Արտակարգ աջակցություն")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">{t("ჩვენი მდებარეობა", "Our Location", undefined, "Մեր գտնվելու վայրը")}</h2>
            <div className="aspect-video rounded-lg overflow-hidden shadow-soft border border-border/70 bg-muted relative">
              <iframe
                title={t("AGROIT-ის მდებარეობის რუკა", "AGROIT location map", undefined, "AGROIT գտնվելու քարտեզ")}
                src="https://www.google.com/maps?q=6%20Gia%20Abesadze%20St,%20Tbilisi&output=embed"
                loading="lazy"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <p className="mt-4 text-center text-muted-foreground">
              <a
                href="https://www.google.com/maps/place/6+Gia+Abesadze+St,+Tbilisi"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline font-semibold"
              >
                {t("Google Maps-ში ნახვა", "Open in Google Maps", undefined, "Բացել Google Maps-ում")}
              </a>
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default Contact;
