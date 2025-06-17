import Image from "next/image";

import { useQuery } from "@tanstack/react-query";
import { getGalleries } from "../../../../services/apiGalleries";
import { useLocale } from "next-intl";

const WidgetInstagramPost = () => {
  const locale = useLocale();

  const { data: gallery } = useQuery({
    queryKey: ["gallery"],
    queryFn: getGalleries,
  });

  return (
    <div className="axil-single-widget widget widget_instagram mb--30">
      <h5 className="widget-title">
        {locale === "en" ? "Our Galleries" : "معارضنا"}
      </h5>
      <ul className="instagram-post-list-wrapper">
        {gallery?.map((data) => (
          <li className="instagram-post-list" key={data.id}>
            <a href={`/gallery/${data.id}`}>
              <Image
                src={data.image_urls[0]}
                height={105}
                width={105}
                alt="Instagram Images"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WidgetInstagramPost;
