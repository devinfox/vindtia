import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import DesignerForm from "@/components/admin/DesignerForm";

type Params = Promise<{ id: string }>;

export default async function EditDesignerPage(props: { params: Params }) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: designer } = await supabase
    .from("designers")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!designer) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white mb-8">
        Edit Designer
      </h1>
      <DesignerForm designer={designer} />
    </div>
  );
}
