import Link from "next/link";
import Image from "next/image";
import { SectionTitleTwo } from "../../elements/sectionTitle/SectionTitle";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../../../services/apicatogry";
import { useLocale } from "next-intl";

const CategoryListGrid = () => {
  const locale = useLocale();
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  return (
    <section className="py-5" style={{ backgroundColor: "rgb(139, 0, 0)" }}>
      <div className="container">

        <SectionTitleTwo
          title={locale === "ar" ? "التصنيفات" : "CATEGORIES"}
          btnText={locale === "ar" ? "عرض الكل" : "See All Topics"}
          btnUrl={`/${locale}/news`}
        />

        <div className="row g-4">
          {categories?.map((cat) => (
            <div
              key={cat.id}
              className="col-lg-2 col-md-3 col-sm-4 col-6"
            >
              <Link href={`/${locale}/news?category=${cat.id}`} passHref>
                <a className="text-decoration-none">
                  <div className="card bg-light bg-opacity-10 shadow-sm border-0 h-100 category-card-hover">
                    <div className="d-flex flex-column align-items-center p-4 text-center">
                      
                      <div className="mb-3">
                        <Image
                          src={cat.image_url}
                          alt={locale === "ar" ? cat.name_ar : cat.name_en}
                          width={100}
                          height={100}
                          className="rounded"
                        />
                      </div>
                      
                      <h5 className="mb-0 text-white category-title" style={{fontSize: '18px', fontWeight: 'bold'}}>
                        {locale === "ar" ? cat.name_ar : cat.name_en}
                      </h5>
                    
                    </div>
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategoryListGrid;