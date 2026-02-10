import DesignerForm from "@/components/admin/DesignerForm";

export default function NewDesignerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white mb-8">
        Add New Designer
      </h1>
      <DesignerForm />
    </div>
  );
}
