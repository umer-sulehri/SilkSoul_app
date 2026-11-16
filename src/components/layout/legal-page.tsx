import { Container } from "@/components/ui/layout";

export function LegalPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
}) {
  return (
    <div className="pb-24 pt-12 sm:pt-16">
      <Container size="narrow">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Policies</p>
        <h1 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">{intro}</p>
        <p className="mt-2 text-xs text-muted">Last updated: {updated}</p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-serif text-2xl text-ink">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
