import Image from "next/image";
import InstaData from "../../data/instagram/instagram.json";
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
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="section-title">
              <h2 className="title">
                {locale === "ar" ? "معرض الصور" : "Gallery"}
              </h2>
            </div>
          </div>
        </div>
        <div className="row mt--30">
          <div className="col-lg-12">
            <ul className="instagram-post-list">
              {galleries?.map((data) => (
                <li className="single-post" key={data.id}>
                  <a href={`/${locale}/gallery/${data.id}`}>
                    <Image
                      src={data.image_urls[0]}
                      height={190}
                      width={190}
                      alt="Instagram Images"
                    />
                    <span className="instagram-button">
                      <i className="fa fa-image" />
                    </span>
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
