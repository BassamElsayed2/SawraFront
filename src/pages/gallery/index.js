import React from "react";
import HeadTitle from "../../common/elements/head/HeadTitle";
import HeaderOne from "../../common/elements/header/HeaderOne";
import FooterThree from "../../common/elements/footer/FooterThree";
import { useLocale } from "next-intl";
import { getGalleries } from "../../../services/apiGalleries";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";

export default function GalleryPage() {
  const locale = useLocale();

  const { data: galleries = [] } = useQuery({
    queryKey: ["galleries"],
    queryFn: getGalleries,
  });

  return (
    <>
      <HeadTitle pageTitle={locale === "en" ? "Gallery" : "معرض الصور"} />
      <HeaderOne pClass="header-light header-sticky header-with-shadow" />

      <div className="container py-5">
        <h1 className="text-center mb-5 fw-bold">
          {locale === "en" ? "Our Gallery" : "معرض الصور"}
        </h1>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {galleries?.map((gallery, index) => (
            <motion.div
              key={gallery.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="col"
            >
              <Link href={`/${locale}/gallery/${gallery.id}`}>
                <a className="card h-100 shadow-sm border-0">
                  <div
                    className="card-img-wrapper"
                    style={{ height: "250px", overflow: "hidden" }}
                  >
                    <img
                      src={gallery.image_urls[0]}
                      alt={gallery.title_en || "Gallery Image"}
                      className="card-img-top w-100 h-100 object-fit-cover"
                      style={{ transition: "transform 0.3s ease" }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.1)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    />
                  </div>
                  <div className="card-body text-center">
                    <h3 className="card-title h5 mb-2">
                      {locale === "en" ? gallery.title_en : gallery.title_ar}
                    </h3>
                    {gallery.description && (
                      <p className="card-text small text-muted">
                        {locale === "en"
                          ? gallery.description_en
                          : gallery.description_ar}
                      </p>
                    )}
                  </div>
                </a>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <FooterThree />
    </>
  );
}
