import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQueries } from "@tanstack/react-query";
import { getCategoryById } from "../../../../services/apicatogry";

const PostSectionNine = ({ news, bgColor }) => {
  const { locale } = useRouter();

  // فلترة الأخبار العاجلة
  const postData = news?.filter((item) => item.status === "urgent") || [];

  // استخراج البوست الأساسي
  const firstPost = postData[0];

  // تحديد البوستات التي نريد عرضها (الباقي بعد أول بوست)
  const slicedPosts = postData.slice(1, 5);

  // جلب بيانات الكاتيجوري لكل بوست
  const categoriesQueries = useQueries({
    queries: slicedPosts.map((post) => ({
      queryKey: ["category", post.category_id],
      queryFn: () => getCategoryById(post.category_id),
      enabled: !!post.category_id,
    })),
  });

  const firstCategory = categoriesQueries[0]?.data;

  return (
    <div className={`axil-tech-post-banner ${bgColor || "bg-color-grey"}`}>
      <div className="container">
        <div className="row">
          {/* عرض أول بوست إن وجد */}

          {firstPost && (
            <div className="col-xl-6 col-md-12 col-12 mt--30">
              <div className="content-block post-grid post-grid-transparent">
                <div className="post-thumbnail">
                  <Link href={`/${locale}/post/${firstPost.id}`}>
                    <a>
                      <Image
                        src={firstPost.images?.[0] || "/"}
                        height={600}
                        width={600}
                        priority={true}
                        alt=""
                      />
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
                    <h3 className="title">
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

          {/* عرض باقي البوستات */}
          <div className="col-xl-6 col-lg-12 col-md-12 col-md-6 col-12">
            <div className="row">
              {slicedPosts.map((data, index) => {
                const categoryData = categoriesQueries[index]?.data;

                return (
                  <div
                    className="col-lg-6 col-md-6 col-sm-6 col-12 mt--30"
                    key={data.id}
                  >
                    <div className="content-block post-default image-rounded">
                      <div className="post-thumbnail">
                        <Link href={`/${locale}/post/${data.id}`}>
                          <a>
                            <Image
                              src={data.images?.[0] || "/"}
                              height={190}
                              width={285}
                              priority={true}
                              alt=""
                            />
                          </a>
                        </Link>
                      </div>
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
                                      locale === "en"
                                        ? categoryData?.name_en
                                        : categoryData?.name_ar
                                    }
                                  >
                                    {locale === "en"
                                      ? categoryData?.name_en
                                      : categoryData?.name_ar}
                                  </span>
                                </span>
                              </a>
                            </Link>
                          </div>
                        </div>
                        <h5 className="title">
                          <Link href={`/${locale}/post/${data.id}`}>
                            <a>
                              {locale === "en" ? data.title_en : data.title_ar}
                            </a>
                          </Link>
                        </h5>
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

export default PostSectionNine;
