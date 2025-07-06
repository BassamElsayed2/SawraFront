import React from "react";
import HeadTitle from "../../common/elements/head/HeadTitle";
import HeaderOne from "../../common/elements/header/HeaderOne";
import FooterThree from "../../common/elements/footer/FooterThree";
import { useLocale } from "next-intl";
import { getGalleries } from "../../../services/apiGalleries";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

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
        <h1 className="text-center mb-5 fw-bold text-danger">
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
                <a
                  className="card h-100 border-0"
                  style={{
                    backgroundColor: "#fff0f0",
                    borderRadius: "1rem",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <div
                    className="card-img-wrapper"
                    style={{ height: "250px", overflow: "hidden" }}
                  >
                    <Image
                      src={gallery.image_urls[0]}
                      alt={gallery.title_en || "Gallery Image"}
                      className="card-img-top w-100 h-100 object-fit-cover"
                      style={{ transition: "transform 0.3s ease" }}
                      width={600}
                      height={400}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.05)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    />
                  </div>

                  <div className="card-body text-center p-3">
                    <h6
                      className="card-title"
                      style={{
                        fontSize: "1.7rem",
                        fontWeight: "600",
                        color: "#b91c1c",
                      }}
                    >
                      {locale === "en"
                        ? gallery.title_en
                        : gallery.title_ar}
                    </h6>

                    {gallery.description && (
                      <p className="card-text small text-muted mt-2">
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
