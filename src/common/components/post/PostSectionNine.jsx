import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQueries } from "@tanstack/react-query";
import { getCategoryById } from "../../../../services/apicatogry";

const PostSectionNine = ({ news, bgColor }) => {
  const { locale } = useRouter();

  const postData = news?.filter((item) => item.status === "most_sold") || [];
  const firstPost = postData[0];
  const slicedPosts = postData.slice(1, 5);

  const categoriesQueries = useQueries({
    queries: slicedPosts.map((post) => ({
      queryKey: ["category", post.category_id],
      queryFn: () => getCategoryById(post.category_id),
      enabled: !!post.category_id,
    })),
  });

  return (
    <div className={`axil-tech-post-banner ${bgColor || "bg-color-white"}`}>
      <div className="container">
        <div className="row">
          {/* أول بوست كبير */}
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
                    {/* ⭐ تصنيف "الأكثر مبيعًا" */}
                    <div className="post-cat mb-2">
                      <span
                        className="px-4 py-2 text-white"
                        style={{
                          background: "linear-gradient(45deg, #dc2626, #f97316)",
                          borderRadius: "9999px",
                          fontSize: "1.1rem",
                          display: "inline-block",
                        }}
                      >
                        {locale === "en" ? "Most Sold" : "⭐ الاكثر مبيعا"}
                      </span>
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

                    <div className="product-price-box mt-3 ">
                      <div className="price-blur fs-2 ">
                        <span className="price-current text-warning">
                          {locale === "en" ? "50 EGP" : "٥٠ ج.م"}
                        </span>
                        <span className="price-old ms-3">
                          {locale === "en" ? "100 EGP" : "١٠٠ ج.م"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* باقي البوستات */}
          <div className="col-xl-6 col-lg-12 col-md-12 col-md-6 col-12">
            <div className="row">
              {slicedPosts.map((data, index) => (
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
                      <div className="post-cat mb-2">
                      <span
  className="most-sold-badge px-4 py-2 text-white"
  style={{
    background: "linear-gradient(45deg, #dc2626, #f97316)",
    borderRadius: "9999px",
    fontSize: "1.1rem",
    display: "inline-block",
    transition: "all 0.3s ease-in-out",
  }}
>
  {locale === "en" ? "Most Sold" : "⭐ الاكثر مبيعا"}
</span>

                      </div>

                      <h5 className="title">
                        <Link href={`/${locale}/post/${data.id}`}>
                          <a>
                            {locale === "en"
                              ? data.title_en
                              : data.title_ar}
                          </a>
                        </Link>
                      </h5>

                      <div className="product-price-box mt-3">
                        <div className="price-blur bg-light fs-5 ">
                          <span className="price-current ">
                            {locale === "en" ? "75 EGP" : "٧٥ ج.م"}
                          </span>
                          <span className="price-old ms-3">
                            {locale === "en" ? "120 EGP" : "١٢٠ ج.م"}
                          </span>
                        </div>
                      </div>
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

export default PostSectionNine;
