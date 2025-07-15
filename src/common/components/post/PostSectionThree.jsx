import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQueries } from "@tanstack/react-query";
import { getCategoryById } from "../../../../services/apicatogry";
import { useTranslation } from "next-i18next";
import AddBanner from "../ad-banner/AddBanner";
import { SectionTitleTwo } from "../../elements/sectionTitle/SectionTitle";

const PostSectionThree = ({ postData, adBanner, bgColor }) => {
  const { locale } = useRouter();
  const { t } = useTranslation("common");

  // الفيديوهات
  const videoPosts = postData?.filter((post) => post.yt_code || post.video_url) || [];

  // استخراج الفيديو الأساسي
  const firstPost = videoPosts[0];

  // تحديد الفيديوهات التي نريد عرضها (الباقي بعد أول فيديو)
  const slicedPosts = videoPosts.slice(1, 5);

  // جلب بيانات الكاتيجوري لكل فيديو
  const categoriesQueries = useQueries({
    queries: slicedPosts.map((post) => ({
      queryKey: ["category", post.category_id],
      queryFn: () => getCategoryById(post.category_id),
      enabled: !!post.category_id,
    })),
  });

  const firstCategory = categoriesQueries[0]?.data;

  return (
    <div className="axil-tech-post-banner relative pb-5 post-section-three">
        <div className="d-flex justify-content-between align-items-center pt-5">
        <div className="container">
          <SectionTitleTwo
          title={locale === "ar" ? "أحدث الفيديوهات" : "LATEST VIDEOS"}
          btnText={locale === "ar" ? "عرض الكل" : "View All"}
          btnUrl={`/${locale}/gallery`}
          className="category-section-title"
        />
        </div>

      </div>
      <div className="container post-section-three-container">
        <div className="row">
          {firstPost && (
            <div className="col-xl-6 col-md-12 col-12 mt--30">
              <div className="content-block post-grid post-grid-transparent category-card-hover">
                <div className="post-thumbnail position-relative">
                  <Link href={`/${locale}/post/${firstPost.id}`}>
                    <a>
                      <Image
                        src={firstPost.images?.[0] || "/"}
                        height={600}
                        width={600}
                        priority={true}
                        alt=""
                      />
                      <div className="video-play-icon video-play-icon-large">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </a>
                  </Link>
                </div>
                <div className="post-grid-content">
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
                                  locale === "en"
                                    ? firstCategory?.name_en
                                    : firstCategory?.name_ar
                                }
                              >
                                {locale === "en"
                                  ? firstCategory?.name_en
                                  : firstCategory?.name_ar}
                              </span>
                            </span>
                          </a>
                        </Link>
                      </div>
                    </div>

                    <h3 className="title category-title">
                      <Link href={`/${locale}/post/${firstPost.id}`}>
                        <a>
                          {locale === "en"
                            ? firstPost.title_en
                            : firstPost.title_ar}
                        </a>
                      </Link>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="col-xl-6 col-lg-12 col-md-12 col-md-6 col-12">
            <div className="row">
              {slicedPosts.map((data, index) => {
                const categoryData = categoriesQueries[index]?.data;

                return (
                  <div
                    className="col-lg-6 col-md-6 col-sm-6 col-12 mt--30"
                    key={data.id}
                  >
                    <div className="content-block post-default image-rounded category-card-hover">
                      <div className="post-thumbnail position-relative">
                        <Link href={`/${locale}/post/${data.id}`}>
                          <a>
                            <Image
                              src={data.images?.[0] || "/"}
                              height={190}
                              width={285}
                              priority={true}
                              alt=""
                            />

                            <div className="video-play-icon video-play-icon-small">
                              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </a>
                        </Link>
                      </div>
                      <div className="post-content">
                        <div className="d-flex flex-column justify-content-between align-items-center">
                          <h5 className="title category-title">
                            <Link href={`/${locale}/post/${data.id}`}>
                              <a>
                                {locale === "en"
                                  ? data.title_en
                                  : data.title_ar}
                              </a>
                            </Link>
                          </h5>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostSectionThree;
