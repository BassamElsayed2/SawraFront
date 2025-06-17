import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { slugify } from "../../../../utils";
import { getNewsById } from "../../../../../../services/apiNews";
import { useLocale } from "next-intl";

const PostMetaOne = ({ metaData }) => {
  const locale = useLocale();

  return (
    <div className="banner banner-single-post post-formate post-standard alignwide">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="content-block">
              <div className="post-thumbnail">
                <Image
                  src={metaData.images[0]}
                  alt={metaData.title_en}
                  height={720}
                  width={1440}
                />
              </div>

              <div className="post-content">
                <div className="post-cat">
                  <div className="post-cat-list">
                    <Link href={`/category/${slugify(metaData.cate)}`}>
                      <a className="hover-flip-item-wrapper">
                        <span className="hover-flip-item">
                          <span data-text={metaData.cate}>{metaData.cate}</span>
                        </span>
                      </a>
                    </Link>
                  </div>
                </div>
                <h1 className="title">
                  {locale === "en" ? metaData.title_en : metaData.title_ar}
                </h1>

                <div className="post-meta-wrapper">
                  <div className="post-meta">
                    <div className="content">
                      {metaData.publisher_name && (
                        <h6 className="post-author-name">
                          <a className="hover-flip-item-wrapper">
                            <span className="hover-flip-item">
                              <span data-text={metaData.publisher_name}>
                                {metaData.publisher_name}
                              </span>
                            </span>
                          </a>
                        </h6>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostMetaOne;
