import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";

const WidgetVideoPost = ({ postData }) => {
  const locale = useLocale();

  const videoPosts = postData?.filter((post) => post.yt_code);

  return (
    <div className="axil-single-widget widget-style-2 widget widget_post mt--30">
      <h5
        className="widget-title mb-4"
        style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#b91c1c" }}
      >
        {locale === "en" ? "Featured Videos" : "الفيديوهات المميزة"}
      </h5>

      <div className="video-post-wrapepr">
        {videoPosts?.slice(-3).map((data) => (
          <div
            className="content-block image-rounded mb-4"
            key={data.id}
            style={{
              backgroundColor: "#fff0f0",
              borderRadius: "1rem",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              overflow: "hidden",
              transition: "transform 0.3s ease",
            }}
          >
            {data.images[0] && (
              <div
                className="post-thumbnail position-relative"
                style={{ overflow: "hidden" }}
              >
                <Link href={`/post/${data.id}`}>
                  <a>
                    <Image
                      src={data.images[0]}
                      alt={data.title_en}
                      height={220}
                      width={330}
                      style={{
                        width: "100%",
                        height: "auto",
                        transition: "transform 0.3s ease",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.05)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                      priority
                    />
                  </a>
                </Link>

                <Link href={`/post/${data.id}`}>
  <a
    className="video-popup"
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "white", // دائرة بيضاء
      borderRadius: "50%",
      padding: "1rem",
    }}
  >
    <span
      className="play-icon"
      style={{
        display: "inline-block",
        width: "24px",
        height: "24px",
        backgroundColor: "black", // الأيقونة سوداء
        mask: "url('/icons/play.svg') center / contain no-repeat",
        WebkitMask: "url('/icons/play.svg') center / contain no-repeat",
      }}
    />
  </a>
</Link>

              </div>
            )}

            <div className="post-content p-3">
              <h6
                className="title"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  color: "#1f2937",
                }}
              >
                <Link href={`/post/${data.id}`}>
                  <a style={{ color: "#b91c1c", textDecoration: "none" }}>
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
