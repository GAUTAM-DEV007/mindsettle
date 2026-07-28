import Link from "next/link";

const VARIANTS = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-500",
  secondary:
    "bg-transparent text-emerald-700 border border-emerald-600 hover:bg-emerald-50",
  ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100",
};

export default function Button({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const classes = `inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${VARIANTS[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
