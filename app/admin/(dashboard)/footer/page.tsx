import type { Metadata } from "next";
import { inputClass, labelClass } from "@/components/admin/formStyles";
import { getFooterSettings } from "@/lib/footer-settings";
import { updateFooterSettings } from "./actions";
import SubmitButton from "@/components/ui/SubmitButton";
import FormAlert from "@/components/ui/FormAlert";

export const metadata: Metadata = {
  title: "Footer",
};

export default async function FooterAdminPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  const footer = await getFooterSettings();

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Footer</h1>
      <p className="mt-1 text-sm text-slate-500">
        Deskripsi, kontak, dan link sosial media yang tampil di footer setiap halaman publik.
      </p>

      <FormAlert code={searchParams.flash} />

      <form action={updateFooterSettings} className="mt-6 space-y-4">
        <div>
          <label htmlFor="description" className={labelClass}>Deskripsi</label>
          <textarea id="description" name="description" required rows={4} defaultValue={footer.description} className={inputClass} />
        </div>
        <div>
          <label htmlFor="address" className={labelClass}>Alamat</label>
          <textarea id="address" name="address" required rows={2} defaultValue={footer.address} className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Telepon</label>
          <input id="phone" name="phone" required defaultValue={footer.phone} className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" name="email" type="email" required defaultValue={footer.email} className={inputClass} />
        </div>
        <div>
          <label htmlFor="facebookUrl" className={labelClass}>
            Facebook <span className="font-normal text-slate-400">(opsional)</span>
          </label>
          <input id="facebookUrl" name="facebookUrl" placeholder="https://facebook.com/..." defaultValue={footer.facebookUrl} className={inputClass} />
        </div>
        <div>
          <label htmlFor="instagramUrl" className={labelClass}>
            Instagram <span className="font-normal text-slate-400">(opsional)</span>
          </label>
          <input id="instagramUrl" name="instagramUrl" placeholder="https://instagram.com/..." defaultValue={footer.instagramUrl} className={inputClass} />
        </div>
        <div>
          <label htmlFor="youtubeUrl" className={labelClass}>
            YouTube <span className="font-normal text-slate-400">(opsional)</span>
          </label>
          <input id="youtubeUrl" name="youtubeUrl" placeholder="https://youtube.com/..." defaultValue={footer.youtubeUrl} className={inputClass} />
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton>Simpan Perubahan</SubmitButton>
        </div>
      </form>
    </div>
  );
}
