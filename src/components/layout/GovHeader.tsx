import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { useLocation } from "react-router-dom";

export function GovHeader({ title, description, breadcrumbs }: { title: string, description?: string, breadcrumbs?: { label: string, href?: string }[] }) {
  const location = useLocation();

  return (
    <div className="space-y-4 mb-8">
      {/* Breadcrumbs padrão Gov */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {breadcrumbs ? (
            breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </div>
            ))
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="border-l-4 border-primary pl-4 py-1">
        <h1 className="text-3xl font-bold text-[#071D41] tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-lg leading-relaxed max-w-4xl">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
