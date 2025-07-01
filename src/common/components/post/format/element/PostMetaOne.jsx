import Image from "next/image";
import Link from "next/link";
import { slugify } from "../../../../utils";
import { useLocale } from "next-intl";

const PostMetaOne = ({ metaData }) => {
  const locale = useLocale();

  return (
    <div className="banner banner-single-post post-formate post-standard alignwide py-5">
    <div className="container">
      <div className="position-relative w-100">
        {/* الصورة */}
        <div className="image-wrapper-full rounded-4 overflow-hidden shadow-sm mb-4">
          <Image
            src={metaData.images[0]}
            alt={metaData.title_en}
            layout="responsive"
            width={1200} 
            height={600}
            objectFit="cover"
            priority
             className="rounded-4"
          />
        </div>
  
        {/* صندوق العنوان والسعر */}
        <div className="blur-meta-box px-4 py-4 px-md-5 py-md-5">
          <div className="d-flex align-items-center mb-3">
            <div className="post-cat-list">
              <Link href={`/category/${slugify(metaData.cate)}`}>
                <a className="badge bg-primary fs-6 px-3 py-2 text-white">
                  {metaData.cate}
                </a>
              </Link>
            </div>
          </div>
  
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
            <h1 className="title display-5 fw-bold text-white mb-0">
              {locale === "en" ? metaData.title_en : metaData.title_ar}
            </h1>
  
            <div className="product-price-box ">
              <div className="price-blur fs-3">
                <span className="price-current">
                  {locale === "en" ? "50 EGP" : "٥٠ ج.م"}
                </span>
                <span className="price-old ms-3">
                  {locale === "en" ? "100 EGP" : "١٠٠ ج.م"}
                </span>
              </div>
            </div>
          </div>
  
          {metaData.publisher_name && (
            <h6 className="text-muted">
              {locale === "en" ? "Publisher: " : "الناشر: "}
              <span className="text-dark fw-medium">
                {metaData.publisher_name}
              </span>
            </h6>
          )}
        </div>
      </div>
    </div>
  
    {/* ستايل */}
    <style jsx>{`
  .image-wrapper-full {
    width: 100%;
    aspect-ratio: 2 / 1;
    position: relative;
  }

  .blur-meta-box {
    position: relative;
    top: -150px;
    margin: 0 auto;
    width: 95%;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 24px;
    z-index: 2;
    box-shadow: 0 0 16px rgba(0, 0, 0, 0.08);
  }

  .price-blur {
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(4px);
    padding: 6px 14px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
  }

  .price-current {
    font-weight: 600;
    color: #198754;
  }

  .price-old {
    text-decoration: line-through;
    color: #dc3545;
  }
`}</style>

  </div>
  
  
  );
};

export default PostMetaOne;
