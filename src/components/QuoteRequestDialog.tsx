import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCreateContactSubmission } from "@/hooks/useContactSubmissions";
import { useLanguage } from "@/contexts/LanguageContext";

const quoteSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
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
  company: z
    .string()
    .max(120, "Company name is too long")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName?: string | null;
  productSlug?: string | null;
  categoryName?: string | null;
  productPath?: string;
}

export const QuoteRequestDialog = ({
  open,
  onOpenChange,
  productName,
  productSlug,
  categoryName,
  productPath,
}: QuoteRequestDialogProps) => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const createSubmission = useCreateContactSubmission();

  const defaultMessage = useMemo(() => {
    const name = productName || t("ეს პროდუქტი", "this product", undefined, "\u0561\u0575\u057d \u0561\u057a\u0580\u0561\u0576\u0584\u0568");
    return t(
      `მე მაინტერესებს ${name}. გთხოვთ მომაწოდოთ ფასები, ხელმისაწვდომობა და შესაძლო დაფინანსების პირობები.`,
      `I’m interested in ${name}. Please share pricing, availability, and any financing options.`,
      undefined,
      `\u0535\u057d \u0570\u0565\u057f\u0561\u0584\u0580\u0584\u0580\u057e\u0561\u056e \u0565\u0574 ${name}-\u0578\u057e: \u053d\u0576\u0564\u0580\u0578\u0582\u0574 \u0565\u0574 \u057f\u0580\u0561\u0574\u0561\u0564\u0580\u0565\u056c \u0563\u0576\u0565\u0580\u0568, \u0570\u0561\u057d\u0561\u0576\u0565\u056c\u056b\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0568 \u0587 \u0586\u056b\u0576\u0561\u0576\u057d\u0561\u057e\u0578\u0580\u0574\u0561\u0576 \u057f\u0561\u0580\u0562\u0565\u0580\u0561\u056f\u0576\u0565\u0580\u0568:`
    );
  }, [language, productName, t]);

  const [formData, setFormData] = useState<QuoteFormData>({
    name: "",
    phone: "",
    email: "",
    company: "",
    message: defaultMessage,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteFormData, string>>>({});
  const [messageTouched, setMessageTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setErrors({});
      setMessageTouched(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        company: "",
        message: defaultMessage,
      });
    }
  }, [open, defaultMessage]);

  useEffect(() => {
    if (!messageTouched) {
      setFormData((prev) => ({
        ...prev,
        message: defaultMessage,
      }));
    }
  }, [defaultMessage, messageTouched]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    const validation = quoteSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof QuoteFormData, string>> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof QuoteFormData] = err.message;
        }
      });
      setErrors(fieldErrors);

      toast({
        title: t("გთხოვთ შეავსოთ ფორმა სწორად", "Check the form", undefined, "\u054d\u057f\u0578\u0582\u0563\u0565\u0584 \u0571\u0587\u0568"),
        description: t(
          "ზოგიერთი მონაცემი არასწორია. გთხოვთ გადაამოწმოთ მონიშნული ველები.",
          "Some details look incorrect. Please review the highlighted fields.",
          undefined,
          "\u0548\u0580\u0578\u0577 \u057f\u057e\u0575\u0561\u056c\u0576\u0565\u0580 \u057d\u056d\u0561\u056c \u0565\u0576 \u0569\u057e\u0578\u0582\u0574: \u053d\u0576\u0564\u0580\u0578\u0582\u0574 \u0565\u0574 \u057d\u057f\u0578\u0582\u0563\u0565\u0584 \u0576\u0577\u057e\u0561\u056e \u0564\u0561\u0577\u057f\u0565\u0580\u0568:"
        ),
        variant: "destructive",
      });
      return;
    }

    try {
      const sanitized = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || "",
        company: formData.company?.trim() || "",
        message: formData.message.trim(),
      };

      const submissionCategory =
        categoryName ||
        t("შეთავაზების მოთხოვნა", "Quote Request", undefined, "\u0533\u0576\u0561\u0575\u056b\u0576 \u0561\u057c\u0561\u057b\u0561\u0580\u056f");

      const contextLines = [
        sanitized.company ? `Company: ${sanitized.company}` : null,
        productName ? `Product: ${productName}` : null,
        productSlug ? `Product slug: ${productSlug}` : null,
        productPath ? `Product URL: ${productPath}` : null,
      ].filter(Boolean);

      const composedMessage = [sanitized.message, ...contextLines].join("\n\n");

      await createSubmission.mutateAsync({
        name: sanitized.name,
        phone: sanitized.phone,
        email: sanitized.email || null,
        category: submissionCategory,
        message: composedMessage,
      });

      toast({
        title: t("მოთხოვნა გაიგზავნა", "Request sent", undefined, "\u0540\u0561\u0580\u0581\u0578\u0582\u0574\u0576 \u0578\u0582\u0572\u0561\u0580\u056f\u057e\u0561\u056e \u0567"),
        description: t(
          "ჩვენი გუნდი მალევე დაგიკავშირდებათ ფასის დეტალებით.",
          "Our team will reach out shortly with pricing details.",
          undefined,
          "\u0544\u0565\u0580 \u0569\u056b\u0574\u0568 \u0577\u0578\u0582\u057f\u0578\u057e \u056f\u056f\u0561\u057a\u057e\u056b \u0571\u0565\u0566 \u0570\u0565\u057f \u0563\u0576\u0561\u0575\u056b\u0576 \u0574\u0561\u0576\u0580\u0561\u0574\u0561\u057d\u0576\u0565\u0580\u0578\u057e:"
        ),
      });

      handleClose();
    } catch (error) {
      toast({
        title: t("დაფიქსირდა შეცდომა", "Something went wrong", undefined, "\u053b\u0576\u0579-\u0578\u0580 \u057d\u056d\u0561\u056c \u057f\u0565\u0572\u056b \u0578\u0582\u0576\u0565\u0581\u0561\u057e"),
        description: t(
          "მოთხოვნის გაგზავნა ვერ მოხერხდა. გთხოვთ სცადოთ მოგვიანებით.",
          "We couldn't send your request. Please try again in a moment.",
          undefined,
          "\u0544\u0565\u0576\u0584 \u0579\u056f\u0561\u0580\u0578\u0572\u0561\u0581\u0561\u0576\u0584 \u0578\u0582\u0572\u0561\u0580\u056f\u0565\u056c \u0571\u0565\u0580 \u0570\u0561\u0580\u0581\u0578\u0582\u0574\u0568: \u053d\u0576\u0564\u0580\u0578\u0582\u0574 \u0565\u0574 \u0576\u0578\u0580\u056b\u0581 \u0583\u0578\u0580\u0571\u0565\u0584:"
        ),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl px-0 sm:px-6">
        <DialogHeader className="px-6 sm:px-0">
          <DialogTitle className="text-2xl font-semibold">
            {t("მიიღეთ შეთავაზება", "Request pricing", undefined, "\u054d\u057f\u0561\u0576\u0561\u056c \u0563\u0576\u0561\u0575\u056b\u0576 \u0561\u057c\u0561\u057b\u0561\u0580\u056f")}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {t(
              "მოგვაწოდეთ საკონტაქტო ინფორმაცია და მიიღეთ ინდივიდუალური საფასო შეთავაზება მიწოდებისა და დაფინანსების პირობებით.",
              "Share your contact details and we’ll deliver a tailored price quote with delivery and financing options.",
              undefined,
              "\u054f\u0580\u0561\u0574\u0561\u0564\u0580\u0565\u0584 \u0571\u0565\u0580 \u056f\u0578\u0576\u057f\u0561\u056f\u057f\u0561\u0575\u056b\u0576 \u057f\u057e\u0575\u0561\u056c\u0576\u0565\u0580\u0568 \u0587 \u0574\u0565\u0576\u0584 \u056f\u057f\u0580\u0561\u0574\u0561\u0564\u0580\u0565\u0576\u0584 \u0561\u0576\u0570\u0561\u057f\u0561\u056f\u0561\u0576 \u0563\u0576\u0561\u0575\u056b\u0576 \u0561\u057c\u0561\u057b\u0561\u0580\u056f\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0568 \u0561\u057c\u0561\u0584\u0574\u0561\u0576 \u0587 \u0586\u056b\u0576\u0561\u0576\u057d\u0561\u057e\u0578\u0580\u0574\u0561\u0576 \u057f\u0561\u0580\u0562\u0565\u0580\u0561\u056f\u0576\u0565\u0580\u0578\u057e:"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6 sm:px-0">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="quote-name">
                {t("სახელი და გვარი *", "Full name *", undefined, "\u0531\u0576\u0578\u0582\u0576 \u0561\u0566\u0563\u0561\u0576\u0578\u0582\u0576 *")}
              </Label>
              <Input
                id="quote-name"
                autoComplete="name"
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, name: event.target.value }))
                }
                className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="quote-phone">
                {t("ტელეფონი *", "Phone *", undefined, "\u0540\u0565\u057c\u0561\u056d\u0578\u057d *")}
              </Label>
              <Input
                id="quote-phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, phone: event.target.value }))
                }
                className={errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="quote-email">
                {t("ელფოსტა (არასავალდებულო)", "Email (optional)", undefined, "\u0537\u056c. \u0583\u0578\u057d\u057f (\u056f\u0561\u0574\u0561\u057e\u0578\u0580)")}
              </Label>
              <Input
                id="quote-email"
                type="email"
                autoComplete="email"
                value={formData.email || ""}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, email: event.target.value }))
                }
                className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="quote-company">
                {t("კომპანია (არასავალდებულო)", "Company (optional)", undefined, "\u053f\u0561\u0566\u0574\u0561\u056f\u0565\u0580\u057a\u0578\u0582\u0569\u0575\u0578\u0582\u0576 (\u056f\u0561\u0574\u0561\u057e\u0578\u0580)")}
              </Label>
              <Input
                id="quote-company"
                value={formData.company || ""}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, company: event.target.value }))
                }
                className={errors.company ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-500">{errors.company}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="quote-message">
              {t("პროექტის დეტალები", "Project details", undefined, "\u0546\u0561\u056d\u0561\u0563\u056e\u056b \u0574\u0561\u0576\u0580\u0561\u0574\u0561\u057d\u0576\u0565\u0580")}
            </Label>
            <Textarea
              id="quote-message"
              rows={5}
              value={formData.message}
              onChange={(event) => {
                setFormData((prev) => ({ ...prev, message: event.target.value }));
                setMessageTouched(true);
              }}
              className={errors.message ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500">{errors.message}</p>
            )}
          </div>

          <DialogFooter className="flex-col items-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Button
              type="submit"
              size="lg"
              className="flex-1 rounded-full"
              disabled={createSubmission.isPending}
            >
              {createSubmission.isPending
                ? t("გაგზავნა...", "Sending...", undefined, "\u0548\u0582\u0572\u0561\u0580\u056f\u057e\u0578\u0582\u0574 \u0567...")
                : t("მოთხოვნის გაგზავნა", "Send request", undefined, "\u0548\u0582\u0572\u0561\u0580\u056f\u0565\u056c \u0570\u0561\u0580\u0581\u0578\u0582\u0574\u0568")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1 rounded-full"
              onClick={handleClose}
              disabled={createSubmission.isPending}
            >
              {t("გაუქმება", "Cancel", undefined, "\u0549\u0565\u0572\u0561\u0580\u056f\u0565\u056c")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteRequestDialog;
