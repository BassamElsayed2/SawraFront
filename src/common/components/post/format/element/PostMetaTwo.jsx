"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

const PostMetaTwo = ({ metaData }) => {
  const locale = useLocale();
  if (!metaData) return null;

  return (
    <div className="banner banner-single-post post-formate post-video axil-section-gapBottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            {/* Start Single Slide  */}
            <div className="content-block">
              {/* Start Post Content  */}
              <div className="post-content">
                <div className="post-cat">
                  <div className="post-cat-list">
                    <Link
                      href={`/${locale}/news?category=${metaData?.category?.id}`}
                    >
                      <a className="hover-flip-item-wrapper">
                        <span className="hover-flip-item">
                          <span data-text={metaData?.category?.name_en}>
                            {locale === "en"
                              ? metaData?.category?.name_en
                              : metaData?.category?.name_ar}
                          </span>
                        </span>
                      </a>
                    </Link>
                  </div>
                </div>
                <h1 className="title">
                  {locale === "en" ? metaData?.title_en : metaData?.title_ar}
                </h1>
                {/* Post Meta  */}
                <div className="post-meta-wrapper">
                  <div className="post-meta">
                    <div className="content">
                      {metaData?.publisher_name && (
                        <h6 className="post-author-name">
                          <a className="hover-flip-item-wrapper">
                            <span className="hover-flip-item">
                              <span data-text={metaData?.publisher_name}>
                                {metaData?.publisher_name}
                              </span>
                            </span>
                          </a>
                        </h6>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* End Post Content  */}
            </div>
            {/* End Single Slide  */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostMetaTwo;
