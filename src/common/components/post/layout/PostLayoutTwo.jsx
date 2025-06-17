"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { slugify } from "../../../utils";
import { getNews } from "../../../../../services/apiNews";
import { useRouter } from "next/router";

const PostLayoutTwo = ({ postStart = 0, show = 5, bgColor = "" }) => {
  const { locale: lang } = useRouter();
  const {
    data: dataPost = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["news"],
    queryFn: getNews,
  });

  if (isLoading) return <p>Loading posts...</p>;
  if (error) return <p>Error loading posts: {error.message}</p>;

  if (!dataPost || dataPost.length === 0) return <p>لا يوجد بيانات لعرضها.</p>;

  return (
    <>
      {/* hi* */}

      {dataPost
        .filter((data) => data.category?.name_ar === "سياسة")
        .slice(postStart, postStart + show)
        .map((data, index) => {
          const title = lang === "en" ? data.title_en : data.title_ar;
          const featureImg = data.images?.length > 0 ? data.images[0] : null;
          const categoryName =
            lang === "en" ? data.category?.name_en : data.category?.name_ar;
          const createdAt = data.created_at;
          let formattedDate = "";
          if (createdAt) {
            const dateObj = new Date(createdAt);
            formattedDate =
              lang === "en"
                ? dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : dateObj.toLocaleDateString("ar-EG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
          }

          return (
            <div
              key={data.id ? data.id : `post-${index}`}
              className={`content-block post-list-view axil-control mt--30 ${bgColor} ${
                data.sticky ? "sticky" : ""
              } ${data.postFormat === "quote" ? "format-quote" : ""}`}
            >
              {featureImg ? (
                <div className="post-thumbnail">
                  <Link href={`/post/${data.id}`}>
                    <a>
                      <Image
                        src={featureImg}
                        alt={title?.slice(0, 100) || "post image"}
                        height={250}
                        width={295}
                        priority={true}
                      />
                    </a>
                  </Link>
                  {data.playBtn === true && (
                    <Link href={`/post/${data.id}`}>
                      <a className="video-popup size-medium position-top-center icon-color-secondary">
                        <span className="play-icon"></span>
                      </a>
                    </Link>
                  )}
                </div>
              ) : null}

              <div className="post-content">
                <div className="post-cat">
                  <div className="post-cat-list">
                    <Link href={`/category/${slugify(categoryName || "")}`}>
                      <a className="hover-flip-item-wrapper">
                        <span className="hover-flip-item">
                          <span data-text={categoryName}>{categoryName}</span>
                        </span>
                      </a>
                    </Link>
                  </div>
                </div>

                {data.postFormat === "quote" ? (
                  <blockquote>
                    <h4 className="title">
                      <Link href={`/post/${data.id}`}>
                        <a>{title}</a>
                      </Link>
                    </h4>
                  </blockquote>
                ) : (
                  <h4 className="title">
                    <Link href={`/post/${data.id}`}>
                      <a>{title}</a>
                    </Link>
                  </h4>
                )}

                {/* issuse */}
                <div className="post-meta-wrapper">
                  <div className="post-meta">
                    <div className="content">
                      <h6 className="post-author-name">
                        <Link
                          href={`/author/${slugify(data.author_name || "")}`}
                        >
                          <a className="hover-flip-item-wrapper">
                            <span className="hover-flip-item">
                              <span data-text={data.author_name || " "}>
                                {data.author_name || " "}
                              </span>
                            </span>
                          </a>
                        </Link>
                      </h6>

                      <ul className="post-meta-list">
                        <li>{formattedDate}</li>
                      </ul>
                    </div>
                  </div>

                  <ul className="social-share-transparent justify-content-end">
                    {Array.isArray(data.author_social) &&
                    data.author_social.length > 0 ? (
                      data.author_social.map((social, idx) => (
                        <li key={social.url ? social.url : `social-${idx}`}>
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className={social.icon || "fas fa-link"} />
                          </a>
                        </li>
                      ))
                    ) : (
                      <li style={{ opacity: 0.6, fontStyle: "italic" }}></li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
    </>
  );
};

export default PostLayoutTwo;
