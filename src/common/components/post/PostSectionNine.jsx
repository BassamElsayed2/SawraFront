import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQueries } from "@tanstack/react-query";
import { getCategoryById } from "../../../../services/apicatogry";

const PostSectionNine = ({ news, bgColor }) => {
  const { locale } = useRouter();

  // المبيعات المرتفعة
  const postData = news?.filter((item) => item.status === "most_sold") || [];

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
    <div
      className={`axil-tech-post-banner relative pb-5`}
      style={{
        backgroundColor: "#A00008",
      }}
    >
      <img
        src="/images/Rectangle.png"
        alt="Rectangle"
        style={{
          position: "absolute",
          top: -100,
          left: 0,
          bottom: 0,
          height: 1200,
        }}
      />
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div className="row">
          {/* عرض أول بوست إن وجد */}

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
                      {/* كلمة الاكثر مبيعا على الصورة */}
                      <div
                        className="position-absolute top-0 start-0 m-2"
                        style={{
                          backgroundColor: "rgba(255, 0, 0, 0.8)",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {locale === "en" ? "⭐ BestSellers" : "الاكثر مبيعا⭐"}
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
                    <div className="product-price-box mt-3 ">
                      <div className="price-blur fs-2 ">
                        {firstPost.offers > 0 ? (
                          <>
                            <span className="price-current text-warning">
                              {locale === "en"
                                ? ` ${firstPost.price - firstPost.offers} EGP`
                                : ` ${firstPost.price - firstPost.offers} ج.م`}
                            </span>
                            <span className="price-old ms-3">
                              {locale === "en"
                                ? ` ${firstPost.price} EGP`
                                : ` ${firstPost.price} ج.م`}
                            </span>
                            <span
                              className="discount-badge ms-2"
                              style={{
                                color: "#cc9d2f",
                                padding: "2px 6px",
                                borderRadius: "3px",
                                fontSize: "14px",
                                fontWeight: "bold",
                              }}
                            >
                              {locale === "en"
                                ? `${Math.round(
                                    (firstPost.offers / firstPost.price) * 100
                                  )}% OFF`
                                : `خصم ${Math.round(
                                    (firstPost.offers / firstPost.price) * 100
                                  )}٪`}
                            </span>
                          </>
                        ) : (
                          <span className="price-current text-warning">
                            {locale === "en"
                              ? ` ${firstPost.price} EGP`
                              : ` ${firstPost.price} ج.م`}
                          </span>
                        )}
                      </div>
                    </div>
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

                            <div
                              className="position-absolute top-0 start-0 m-1"
                              style={{
                                backgroundColor: "rgba(255, 0, 0, 0.8)",
                                color: "white",
                                padding: "2px 6px",
                                borderRadius: "3px",
                                fontSize: "10px",
                                fontWeight: "bold",
                              }}
                            >
                              {locale === "en" ? "⭐ BestSellers" : "الاكثر مبيعا⭐"}
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

                          <div className="product-price-box mt-3">
                            <div className="price-blur fs-5 ">
                              {data.offers > 0 ? (
                                <>
                                  <span className="price-current ">
                                    {locale === "en"
                                      ? `${data.price - data.offers} EGP`
                                      : `${data.price - data.offers} ج.م`}
                                  </span>
                                  <span className="price-old ms-3">
                                    {locale === "en"
                                      ? `${data.price} EGP`
                                      : `${data.price} ج.م`}
                                  </span>
                                  <span
                                    className="discount-badge ms-2"
                                    style={{
                                      color: "#cc9d2f",
                                      padding: "1px 4px",
                                      borderRadius: "2px",
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {locale === "en"
                                      ? `${Math.round(
                                          (data.offers / data.price) * 100
                                        )}% OFF`
                                      : `خصم ${Math.round(
                                          (data.offers / data.price) * 100
                                        )}٪`}
                                  </span>
                                </>
                              ) : (
                                <span className="price-current ">
                                  {locale === "en"
                                    ? `${data.price} EGP`
                                    : `${data.price} ج.م`}
                                </span>
                              )}
                            </div>
                          </div>
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

export default PostSectionNine;
