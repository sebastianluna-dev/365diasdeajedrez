type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const alignmentClass = align === "center" ? "mx-auto text-center" : "text-left";

  return (
    <div className={`max-w-3xl ${alignmentClass}`}>
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#ff9143]">
        {eyebrow}
      </p>
      <h2 className="font-serif text-3xl font-semibold leading-tight text-[#f2ede7] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-[#b4a99d] sm:text-lg">
        {description}
      </p>
    </div>
  );
}
