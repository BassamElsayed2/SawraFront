import Image from "next/image";
import { useLocale } from "next-intl";
import { getGalleries } from "../../../services/apiGalleries";
import { useQuery } from "@tanstack/react-query";

const GalleryOne = ({ parentClass }) => {
  const locale = useLocale();

  const { data: galleries = [] } = useQuery({
    queryKey: ["galleries"],
    queryFn: getGalleries,
  });

  return (
    <div
      className={`axil-instagram-area axil-section-gap ${parentClass || ""}`}
      style={{ backgroundColor: "rgb(139, 0, 0)" }}
    >
      <div className="container">
        <div className="row mb-4">
          <div className="col-lg-12 text-center ">
            <h2 className="title text-white">
              {locale === "ar" ? "معرض الصور" : "Gallery"}
            </h2>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-12">
            <ul className="instagram-post-list d-flex flex-wrap justify-content-center gap-3 p-0 m-0 gallery-list-style">
              {galleries.map((data) => (
                <li
                  key={data.id}
                  className="single-post gallery-card-hover position-relative"
                  style={{
                    width: "190px",
                    height: "190px",
                    overflow: "hidden",
                    borderRadius: "0.75rem",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <a
                    href={`/${locale}/gallery/${data.id}`}
                    className="d-block w-100 h-100 position-relative"
                    style={{ textDecoration: "none" }}
                  >
                    <Image
                      src={data.image_urls[0]}
                      alt="Gallery Image"
                      layout="fill"
                      objectFit="cover"
                      className="rounded"
                    />
                   <span
                      className="position-absolute top-50 start-50 translate-middle text-white"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        padding: "0.5rem 1rem",
                        borderRadius: "999px",
                        fontSize: "1.2rem",
                      }}
                    >
                      <i className="fas fa-image" />
                    </span> 
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Optional CSS */}
      {/* تم نقل الأنماط إلى ملف SCSS */}
    </div>
  );
};

export default GalleryOne;
