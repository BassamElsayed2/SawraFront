"use client";

import Link from "next/link";
import Image from "next/image";
import { slugify } from "../../../utils";
import { useRouter } from "next/router";

const PostLayoutThree = ({ dataPost = [], postStart = 0, show = 5 }) => {
  const { locale: lang } = useRouter();

  if (!dataPost || dataPost.length === 0) return <p>لا يوجد بيانات لعرضها.</p>;

  return (
    <>
      {dataPost.slice(postStart, postStart + show).map((data, index) => {
        const title = lang === "en" ? data.title_en : data.title_ar;
        const content = lang === "en" ? data.content_en : data.content_ar;
        const featureImg = Array.isArray(data.images) ? data.images[0] : data.images;
        const categoryName = lang === "en" ? data.category?.name_en : data.category?.name_ar;

        return (
          <div
            key={data.id ? data.id : `post-${index}`}
            className="d-flex gap-4 p-5 mb-5"
            style={{
              background: "linear-gradient(45deg,rgba(252, 165, 165, 0.65),rgba(253, 187, 116, 0.47))",
              borderRadius: "1.5rem",
              boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
              transition: "transform 0.3s ease-in-out",
            }}
          >
            {featureImg && (
              <div style={{ flexShrink: 0 }}>
                <Link href={`/${lang}/post/${data.id}`}>
                  <Image
                    src={featureImg}
                    alt={title?.slice(0, 100) || "post image"}
                    height={200}
                    width={260}
                    className="rounded"
                    style={{ objectFit: "cover" }}
                  />
                </Link>
              </div>
            )}

            <div className="flex-grow-1 text-black">
              <div className="mb-3">
                {categoryName && (
                  <Link href={`/${lang}/news?category=${data.category?.id}`}>
                    <span
                      className="text-white"
                      style={{
                        background: "linear-gradient(45deg, #dc2626, #f97316)",
                        borderRadius: "9999px",
                        padding: "0.6rem 1.2rem",
                        fontSize: "1.6rem",
                        display: "inline-block",
                        fontWeight: "bold",
                      }}
                    >
                      {categoryName}
                    </span>
                  </Link>
                )}
              </div>

              <h4 style={{ fontWeight: "bold", fontSize: "2.6rem", marginBottom: "1rem" }}>
                <Link
                  href={`/${lang}/post/${data.id}`}
                  style={{ 
                    color: "black",
                    transition: "color 0.3s ease",
                    textDecoration: "none"
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "#991b1b")}
                  onMouseLeave={(e) => (e.target.style.color = "black")}
                >
                  {title}
                </Link>
              </h4>

              <p style={{ fontSize: "2rem", opacity: 0.95 }}>
                {content?.replace(/<[^>]+>/g, "").slice(0, 100)}...
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default PostLayoutThree;
