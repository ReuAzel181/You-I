import Link from "next/link";
import type { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PageTransitionLinkProps = LinkProps & {
  children: React.ReactNode;
  className?: string;
};

export function PageTransitionLink({
  children,
  className,
  href,
  ...rest
}: PageTransitionLinkProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    if (isLeaving) {
      return;
    }

    setIsLeaving(true);

    document.documentElement.classList.add("page-transition-leave");

    window.setTimeout(() => {
      router.push(href.toString());

      window.setTimeout(() => {
        document.documentElement.classList.remove("page-transition-leave");
        setIsLeaving(false);
      }, 220);
    }, 160);
  }

  return (
    <Link
      {...rest}
      href={href}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

