import Image from "next/image";

import { useLocale } from "next-intl";
import { getGalleries } from "../../../services/apiGalleries";
import { useQuery } from "@tanstack/react-query";

const GalleryOne = ({ parentClass }) => {
  const locale = useLocale();

  const { data: galleries } = useQuery({
    queryKey: ["galleries"],
    queryFn: getGalleries,
  });

  return (
    <div
      className={`axil-instagram-area axil-section-gap ${parentClass || ""}`}
      style={{
        background: "linear-gradient(45deg,rgba(252, 165, 165, 0.65),rgba(253, 187, 116, 0.47))",
        padding: "3rem 0",
      }}
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="section-title text-center mb-4">
              <h2
                className="title"
                style={{
                  color: "black",
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                }}
              >
                {locale === "ar" ? "معرض الصور" : "Gallery"}
              </h2>
            </div>
          </div>
        </div>
        <div className="row mt--30">
          <div className="col-lg-12">
            <ul
              className="instagram-post-list d-flex flex-wrap justify-content-center gap-3"
              style={{ padding: 0, listStyle: "none" }}
            >
              {galleries?.map((data) => (
                <li
                  className="single-post"
                  key={data.id}
                  style={{
                    borderRadius: "1rem",
                    overflow: "hidden",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <a href={`/${locale}/gallery/${data.id}`}>
                    <div style={{ position: "relative" }}>
                      <Image
                        src={data.image_urls[0]}
                        height={190}
                        width={190}
                        alt="Instagram Images"
                        style={{ objectFit: "cover", borderRadius: "1rem" }}
                      />
                      <span
                        className="instagram-button"
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          background: "rgba(0,0,0,0.6)",
                          padding: "0.5rem 1rem",
                          borderRadius: "9999px",
                          color: "white",
                        }}
                      >
                        <i className="fa fa-image" />
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryOne;
