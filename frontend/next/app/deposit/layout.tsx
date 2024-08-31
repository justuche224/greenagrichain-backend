import type { ReactNode } from "react";

function layout({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="">
        <section className="">{children}</section>
      </main>
    </>
  );
}

export default layout;
