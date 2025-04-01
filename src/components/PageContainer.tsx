import { twMerge } from "tailwind-merge";
import { ToastContainer } from "react-toastify";

export function PageContainer({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <main
      className={twMerge(
        "w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
      <ToastContainer />
    </main>
  );
}
