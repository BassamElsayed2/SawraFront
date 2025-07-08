import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";

const WidgetVideoPost = ({ postData }) => {
  const locale = useLocale();

  const videoPosts = postData?.filter((post) => post.yt_code);

  return (
    <div className="axil-single-widget widget-style-2 widget widget_post mt--30">
      <h5 className="widget-title text-white">
        {locale === "en" ? "Featured Videos" : "الفيديوهات المميزة"}
      </h5>
      <div className="video-post-wrapepr">
        {videoPosts?.slice(-3).map((data) => (
          <div className="content-block image-rounded mt--20 category-card-hover card bg-light bg-opacity-10 shadow-sm border-0 h-100" key={data.id}>
            {data.images[0] && (
              <div className="position-relative">
                <Link href={`/post/${data.id}`}>
                  <a>
                    <Image
                      src={data.images[0]}
                      alt={data.title_en}
                      height={220}
                      width={330}
                      priority={true}
                      style={{ objectFit: "cover" }}
                    />
                  </a>
                </Link>

                {/* أيقونة فيديو */}
                <span
                  className="position-absolute top-50 start-50 translate-middle"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    className="play-icon"
                    style={{
                      width: "0",
                      height: "0",
                      borderLeft: "10px solid white",
                      borderTop: "6px solid transparent",
                      borderBottom: "6px solid transparent",
                    }}
                  />
                </span>
              </div>
            )}
            <div className="post-content p-2 text-white">
              <h6 className="title fw-bold" style={{ fontSize: "14px" }}>
                <Link href={`/post/${data.id}`}>
                  <a className="text-white">
                    {locale === "ar" ? data.title_ar : data.title_en}
                  </a>
                </Link>
              </h6>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WidgetVideoPost;
