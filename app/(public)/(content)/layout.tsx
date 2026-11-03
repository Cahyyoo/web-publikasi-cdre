// Shared full-width wrapper for article/catalog-style routes nested
// under this group: (content)/ppm, (content)/csr, (content)/binaan,
// (content)/penghargaan, (content)/galeri-kegiatan.
export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
