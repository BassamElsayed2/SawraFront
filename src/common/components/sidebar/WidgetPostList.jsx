"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getNews } from "../../../../services/apiNews";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

const formatDate = (dateString, lang) => {
  const date = new Date(dateString);
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const WidgetPostList = () => {
  const locale = useLocale();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    data: dataPost = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["news"],
    queryFn: getNews,
  });

  if (!isClient) {
    return <div suppressHydrationWarning>Loading ...</div>; // Prevents hydration warning
  }

  if (isLoading) return <div>Loading ...</div>;

  const importantPosts = dataPost.filter((post) => post.status === "important");

  return (
    <div className="axil-single-widget widget-style-2 widget widget_post mb--30">
      <h5
        className="widget-title mb-4"
        style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#b91c1c" }}
      >
        {locale === "en" ? "Important News" : "الاخبار المهمة"}
      </h5>

      <div className="post-medium-block">
        {importantPosts.slice(0, 3).map((data) => (
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
            {data.images?.length > 0 && (
              <div
                className="post-thumbnail position-relative"
                style={{ overflow: "hidden" }}
              >
                <Link href={`/post/${data.id}`}>
                  <a>
                    <Image
                      src={data.images[0]}
                      alt={locale === "ar" ? data.title_ar : data.title_en}
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
              
              <div className="product-price-box mt-2">
                <div className="price-blur fs-6">
                  <span className="price-current text-success fw-bold">
                    {locale === "en" ? "50 EGP" : "٥٠ ج.م"}
                  </span>
                </div>
              </div>
              
              <div className="post-meta">
                <ul className="post-meta-list">
                  <li>{formatDate(data.created_at, locale)}</li>
                </ul>
              </div>
            </div>
          </div>
        ))}
        {importantPosts.length === 0 && (
          <p>{locale === "en" ? "No Important News" : "لا توجد اخبار مهمة"}</p>
        )}
      </div>
    </div>
  );
};

export default WidgetPostList;
