"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";
import { type TeamMember, useTeamMembers } from "@/hooks/useTeamMembers";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone } from "lucide-react";
import { getBaseUrl } from "@/utils/config";

const About = () => {
  const { language, t } = useLanguage();
  const { data: teamMembers, isLoading: teamLoading } = useTeamMembers();

  const getLocalizedName = (member: TeamMember) => {
    if (language === "ka") return member.name_ka;
    if (language === "en") return member.name_en;
    if (language === "hy") return member.name_en; // Fallback hy -> en
    return member.name_ru || member.name_en;
  };

  const getLocalizedPosition = (member: TeamMember) => {
    if (language === "ka") return member.position_ka;
    if (language === "en") return member.position_en;
    if (language === "hy") return member.position_en; // Fallback hy -> en
    return member.position_ru || member.position_en;
  };

  // SEO metadata
  const aboutPath = language === "en" ? "/en/about" : language === "ru" ? "/ru/about" : language === "hy" ? "/hy/about" : "/about";
  const seoTitle = t("AGROIT - ჩვენ შესახებ", "About AGROIT", undefined, "AGROIT-ի մասին");
  const seoDescription = language === "en"
    ? "Learn about AGROIT, Georgia's leading provider of Italian agricultural equipment. 9 years of excellence in vineyard, orchard, and dry fruit machinery."
    : "გაიგეთ მეტი AGROIT-ის შესახებ, საქართველოს წამყვანი იტალიური აგროტექნიკის მომწოდებელი. 9 წელი ხარისხისა და სანდოობის.";

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        path={aboutPath}
        image={`${getBaseUrl()}/og-about.jpg`}
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
                {t("ჩვენ შესახებ", "About", undefined, "Մեર մասին")}
              </span>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">
              {t("ჩვენ შესახებ", "About Us", undefined, "Մեր մասին")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {language === "en"
                ? "AGROIT - Leading provider of Italian quality agricultural equipment in Georgia"
                : "AGROIT - იტალიური ხარისხის აგროტექნიკის წამყვანი მომწოდებელი საქართველოში"}
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6">
                    {t("ჩვენი ისტორია", "Our Story", undefined, "Մեր պատմությունը")}
                  </h2>
                  <div className="space-y-4 text-lg text-muted-foreground">
                    <p>
                      {language === "en"
                        ? "AGROIT was founded in 2015 with the goal of bringing European-quality modern technology and techniques to Georgia's agricultural sector."
                        : "კომპანია „აგროიტ“-ი დაფუძნდა 2015 წელს და მიზნად ისახავდა, რომ საქართველოში სოფლის მეურნეობის სექტორში შემოეტანა თანამედროვე ევროპული ხარისხის ტექნოლოგიები და ინოვაციური მეთოდები."}
                    </p>
                    <p>
                      {language === "en"
                        ? "We are official representatives of premium Italian brands and offer a full range of agricultural machinery—from vineyard management to dry fruit cultivation."
                        : "ჩვენ ვართ წამყვანი იტალიური პრემიუმ ბრენდების ოფიციალური წარმომადგენლები და გთავაზობთ სასოფლო-სამეურნეო ტექნიკის სრულ სპექტრს — ბაღის გაშენებიდან დაწყებული, მიღებული პროდუქტის სარეალიზაციოდ მომზადებამდე."}
                    </p>
                    <p>
                      {language === "en"
                        ? "In 10 years, we have become market leaders and provide full service and assistance throughout Georgia."
                        : "10-წლიანი წარმატებული საქმიანობის განმავლობაში, „აგროიტ“-ი ჩამოყალიბდა როგორც ბაზრის ლიდერი და უზრუნველყოფს სრულ სერვისსა და ტექნიკურ მხარდაჭერას საქართველოს მასშტაბით."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <Card>
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <h2 className="text-3xl font-bold mb-4">
                    {t("ჩვენი გუნდი", "Our Team", undefined, "Մեր թիմը")}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-3xl">
                    {language === "en"
                      ? "The AGROIT team brings together agronomists, engineers, and service experts who support farmers at every stage—from planning the first project to long-term maintenance."
                      : "„აგროიტ“-ის გუნდში მუშაობენ აგრონომები, ინჟინრები და სერვის-ინჟინრები, რომლებიც ფერმერებს პროექტის დაგეგმვიდან გრძელვადიან ტექნიკურ მომსახურებამდე გვერდით უდგანან."}
                  </p>
                  <div className="mt-10 w-full">
                    {teamLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((item) => (
                          <Card key={item} className="h-full border-border/70 shadow-soft">
                            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                              <Skeleton className="h-24 w-24 rounded-full" />
                              <div className="space-y-2 w-full flex flex-col items-center">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                              <div className="flex gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-10 w-10 rounded-full" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : teamMembers && teamMembers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teamMembers.map((member) => {
                          const name = getLocalizedName(member);
                          const position = getLocalizedPosition(member);
                          const initials = name
                            ? name
                                .split(" ")
                                .map((part) => part.charAt(0))
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                            : "AG";

                          return (
                            <Card
                              key={member.id}
                              className="h-full overflow-hidden border-border/70 shadow-soft bg-gradient-to-b from-background via-background to-muted/40"
                            >
                              <CardContent className="relative flex h-full flex-col items-center text-center p-6">
                                <div className="pointer-events-none absolute inset-0 opacity-30">
                                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,theme(colors.emerald.200)/40,transparent_35%),radial-gradient(circle_at_80%_0%,theme(colors.emerald.400)/25,transparent_30%)]" />
                                </div>
                                <div className="relative flex flex-col items-center gap-4">
                                  <div className="h-28 w-28 rounded-full border-4 border-primary/60 bg-white shadow-lg overflow-hidden">
                                    {member.image_url ? (
                                      <img
                                        src={member.image_url}
                                        alt={name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center bg-muted text-2xl font-semibold text-primary">
                                        {initials}
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <h3 className="text-xl font-semibold text-foreground">{name}</h3>
                                    <p className="text-sm font-medium uppercase tracking-wide text-primary">
                                      {position}
                                    </p>
                                  </div>
                                  {(member.email || member.phone) && (
                                    <div className="mt-2 flex items-center gap-3 text-muted-foreground">
                                      {member.phone && (
                                        <a
                                          href={`tel:${member.phone}`}
                                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/80 shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:bg-primary/10"
                                        >
                                          <Phone className="h-4 w-4" />
                                        </a>
                                      )}
                                      {member.email && (
                                        <a
                                          href={`mailto:${member.email}`}
                                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/80 shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:bg-primary/10"
                                        >
                                          <Mail className="h-4 w-4" />
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="w-full rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center text-muted-foreground">
                        {language === "en"
                          ? "Our team profiles will appear here soon."
                          : "გუნდის პროფილები მალე გამოჩნდება აქ."}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">
              {t("ჩვენი ღირებულებები", "Our Values", undefined, "Մեր արժեքները")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold mb-3">
                    {t("ხარისხი", "Quality", undefined, "Որակ")}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === "en"
                      ? "Only products from the best Italian manufacturers, distinguished by reliability and durability"
                      : "მხოლოდ საუკეთესო იტალიური მწარმოებლების პროდუქცია, რომელიც გამოირჩევა სანდოობით და გამძლეობით"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-4">🤝</div>
                  <h3 className="text-xl font-semibold mb-3">
                    {t("პარტნიორობა", "Partnership", undefined, "Գործընկերություն")}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === "en"
                      ? "We value every client and build long-term, mutually beneficial relationships"
                      : "ჩვენ ვაფასებთ ყოველ კლიენტს და ვაშენებთ გრძელვადიან, ურთიერთსასარგებლო ურთიერთობებს"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-4">🔧</div>
                  <h3 className="text-xl font-semibold mb-3">
                    {t("სერვისი", "Service", undefined, "Սպասարկում")}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === "en"
                      ? "24/7 support, quick response and professional service throughout Georgia"
                      : "24/7 მხარდაჭერა, სწრაფი რეაგირება და პროფესიონალური მომსახურება მთელი საქართველოს მასშტაბით"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold mb-2">500+</div>
                <div className="text-primary-foreground/80">
                  {t("კმაყოფილი კლიენტი", "Satisfied Clients", undefined, "Գոհ հաճախորդներ")}
                </div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">10</div>
                <div className="text-primary-foreground/80">
                  {t("წელი ბაზარზე", "Years on the market", undefined, "Տարի շուկայում")}
                </div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">50+</div>
                <div className="text-primary-foreground/80">
                  {t("პროდუქტის მოდელი", "Product Models", undefined, "Ապրանքի մոդելներ")}
                </div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">24/7</div>
                <div className="text-primary-foreground/80">
                  {t("მხარდაჭერა", "Support", undefined, "Աջակցություն")}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default About;
