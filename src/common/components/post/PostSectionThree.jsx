import Link from "next/link";
import Image from "next/image";
import { slugify } from "../../utils";
import { SectionTitleOne } from "../../elements/sectionTitle/SectionTitle";
import AddBanner from "../ad-banner/AddBanner";
import { useLocale } from "next-intl";

const PostSectionThree = ({ postData, adBanner, bgColor }) => {
  const locale = useLocale();

  // Filter posts that have yt_code
  const videoPosts = postData?.filter((post) => post.yt_code);
  const firstPost = videoPosts?.[0];

  return (
    <div
      className={`axil-video-post-area axil-section-gap ${
        bgColor || "bg-color-black"
      }`}
    >
      <div className="container">
        {adBanner === true ? (
          <div className="row">
            <div className="col-lg-12">
              <AddBanner
                img="/images/add-banner/banner-03.webp"
                pClass="mb--30"
              />
            </div>
          </div>
        ) : (
          ""
        )}
        <SectionTitleOne
          title={locale === "ar" ? "أحدث الفيديوهات" : "Latest Videos"}
        />
        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-12 col-md-6 col-12">
            <div className="content-block post-default image-rounded mt--30">
              {firstPost?.images[0] ? (
                <div className="post-thumbnail">
                  <Link href={`${locale}/post/${firstPost?.id}`}>
                    <a>
                      <Image
                        src={firstPost.images[0]}
                        alt={firstPost.title_en}
                        height={500}
                        width={600}
                        priority={true}
                      />
                    </a>
                  </Link>

                  <Link href={`/${locale}/post/${firstPost?.id}`}>
                    <a className="video-popup position-top-center">
                      <span className="play-icon" />
                    </a>
                  </Link>
                </div>
              ) : (
                ""
              )}
              <div className="post-content">
                <div className="post-cat">
                  <div className="post-cat-list">
                    <Link
                      href={`/${locale}/news?category=${firstPost?.category.id}`}
                    >
                      <a className="hover-flip-item-wrapper">
                        <span className="hover-flip-item">
                          <span
                            data-text={
                              locale === "ar"
                                ? firstPost?.category?.name_ar
                                : firstPost?.category?.name_en
                            }
                          >
                            {locale === "en"
                              ? firstPost?.category?.name_en
                              : firstPost?.category?.name_ar}
                          </span>
                        </span>
                      </a>
                    </Link>
                  </div>
                </div>
                <h3 className="title">
                  <Link href={`/${locale}/post/${firstPost?.id}`}>
                    <a>
                      {locale === "ar"
                        ? firstPost?.title_ar
                        : firstPost?.title_en}
                    </a>
                  </Link>
                </h3>
                {firstPost?.author_name && (
                  <div className="post-meta-wrapper">
                    <div className="post-meta">
                      <div className="content">
                        <h6 className="post-author-name">
                          <Link href={`/author`}>
                            <a className="hover-flip-item-wrapper">
                              <span className="hover-flip-item">
                                <span data-text={firstPost?.author_name}>
                                  {firstPost?.author_name}
                                </span>
                              </span>
                            </a>
                          </Link>
                        </h6>
                        <ul className="post-meta-list">
                          <li>{firstPost?.date}</li>
                          <li>{firstPost?.read_time}</li>
                        </ul>
                      </div>
                    </div>
                    <ul className="social-share-transparent justify-content-end">
                      {firstPost?.author_social?.map((social) => (
                        <li key={social.url}>
                          <a href={social.url}>
                            <i className={social.icon} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 col-md-12 col-md-6 col-12">
            <div className="row">
              {videoPosts?.slice(1, 5).map((data) => (
                <div
                  className="col-lg-6 col-md-6 col-sm-6 col-12"
                  key={data._id}
                >
                  <div className="content-block post-default image-rounded mt--30">
                    {data.images[0] ? (
                      <div className="post-thumbnail">
                        <Link href={`/${locale}/post/${data?.id}`}>
                          <a>
                            <Image
                              src={data.images[0]}
                              alt={data.title_en}
                              height={190}
                              width={285}
                              priority={true}
                            />
                          </a>
                        </Link>

                        <Link href={`/${locale}/post/${data?.id}`}>
                          <a className="video-popup size-medium position-top-center">
                            <span className="play-icon" />
                          </a>
                        </Link>
                      </div>
                    ) : (
                      ""
                    )}
                    <div className="post-content">
                      <div className="post-cat">
                        <div className="post-cat-list">
                          <Link
                            href={`/${locale}/news?category=${data?.category.id}`}
                          >
                            <a className="hover-flip-item-wrapper">
                              <span className="hover-flip-item">
                                <span
                                  data-text={
                                    locale === "ar"
                                      ? data.category?.name_ar
                                      : data.category?.name_en
                                  }
                                >
                                  {locale === "ar"
                                    ? data.category?.name_ar
                                    : data.category?.name_en}
                                </span>
                              </span>
                            </a>
                          </Link>
                        </div>
                      </div>
                      <h5 className="title">
                        <Link href={`/${locale}/post/${data?.id}`}>
                          <a>
                            {locale === "ar" ? data.title_ar : data.title_en}
                          </a>
                        </Link>
                      </h5>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostSectionThree;
