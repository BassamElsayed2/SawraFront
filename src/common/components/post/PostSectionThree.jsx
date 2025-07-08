import Link from "next/link";
import Image from "next/image";
import { SectionTitleOne } from "../../elements/sectionTitle/SectionTitle";
import AddBanner from "../ad-banner/AddBanner";
import { useLocale } from "next-intl";
// ... باقي الاستيراد زي ما هو
import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { useRouter } from "next/router";

const PostSectionThree = ({ postData, adBanner, bgColor }) => {
  const locale = useLocale();
  const router = useRouter();
  const videoPosts = postData?.filter((post) => post.yt_code || post.video_url); // دعم مؤقت
  const firstPost = videoPosts?.[0];

  const [showModal, setShowModal] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  const handleOpen = (post) => {
    // لو فيه video_url نعرضه، لو لأ نحط لينك مؤقت
    const tempUrl = post.video_url || "https://www.w3schools.com/html/mov_bbb.mp4";
    setActiveVideoUrl(tempUrl);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setActiveVideoUrl(null);
  };

  // دالة التنقل للصفحة التالية
  const handleNavigate = (post) => {
    // عدل الرابط حسب بنية الروابط لديك
    router.push(`/post/${post.id}`);
  };

  return (
    <div
      className={`axil-video-post-area axil-section-gap ${bgColor || ""}`}
      style={{ backgroundColor: "rgb(139, 0, 0)" }}
    >
      <div className="container">
        {/* بانر إعلاني */}
        {adBanner && (
          <div className="row">
            <div className="col-lg-12">
              <AddBanner img="/images/add-banner/banner-03.webp" pClass="mb--30" />
            </div>
          </div>
        )}

        <SectionTitleOne title={locale === "ar" ? "أحدث الفيديوهات" : "Latest Videos"} />

        <div className="row">
          {/* الفيديو الأساسي الكبير */}
          <div className="col-xl-6 col-lg-6 col-md-12 col-12 ">
            {firstPost && (
              <div
                className="text-decoration-none mt--30 custom-card"
                onClick={() => handleNavigate(firstPost)}
                tabIndex={0}
                role="button"
                style={{ outline: "none" }}
                onKeyDown={e => { if (e.key === 'Enter') handleNavigate(firstPost); }}
              >
                <div className="card bg-white bg-opacity-10 shadow-sm border-0 h-100" style={{ borderRadius: "18px" }}>
                  <div className="position-relative">
                    <Image
                      src={firstPost.images?.[0] || "/images/placeholder.jpg"}
                      height={500}
                      width={600}
                      alt={firstPost.title_en}
                      style={{ objectFit: "cover", borderRadius: "18px 18px 0 0" }}
                    />
                    <div className="position-absolute top-0 start-0 m-1 bg-danger text-white px-2 py-1 rounded fw-bold small">
                      {locale === "ar" ? firstPost?.category?.name_ar : firstPost?.category?.name_en}
                    </div>
                    <span className="position-absolute top-50 start-50 translate-middle bg-dark bg-opacity-50 rounded-circle d-flex justify-content-center align-items-center" style={{ width: "60px", height: "60px" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </div>
                  <div className="p-4 text-center text-white">
                    <h3 className="mb-3 fw-bold" style={{ fontSize: "20px" }}>
                      {locale === "ar" ? firstPost.title_ar : firstPost.title_en}
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* باقي الفيديوهات */}
          <div className="col-xl-6 col-lg-6 col-md-12 col-12">
            <div className="row">
              {videoPosts?.slice(1, 5).map((post) => (
                <div className="col-lg-6 col-md-6 col-sm-6 col-12 mt--30" key={post.id}>
                  <div
                    className="text-decoration-none custom-card"
                    onClick={() => handleNavigate(post)}
                    tabIndex={0}
                    role="button"
                    style={{ outline: "none" }}
                    onKeyDown={e => { if (e.key === 'Enter') handleNavigate(post); }}
                  >
                    <div className="card bg-white bg-opacity-10 shadow-sm border-0 h-100" style={{ borderRadius: "18px" }}>
                      <div className="position-relative">
                        <Image
                          src={post.images?.[0] || "/images/placeholder.jpg"}
                          height={190}
                          width={285}
                          alt={post.title_en}
                          style={{ objectFit: "cover", borderRadius: "18px 18px 0 0" }}
                        />
                        <div className="position-absolute top-0 start-0 m-1 bg-danger text-white px-2 py-1 rounded fw-bold small">
                          {locale === "ar" ? post?.category?.name_ar : post?.category?.name_en}
                        </div>
                        <span className="position-absolute top-50 start-50 translate-middle bg-dark bg-opacity-50 rounded-circle d-flex justify-content-center align-items-center" style={{ width: "50px", height: "50px" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </div>
                      <div className="text-center text-white p-3">
                        <h5 className="mb-0 fw-bold" style={{ fontSize: "16px" }}>
                          {locale === "ar" ? post.title_ar : post.title_en}
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* نافذة تشغيل الفيديو */}
        <Modal show={showModal} onHide={handleClose} size="lg" centered>
          <Modal.Body className="p-0 bg-black">
            {activeVideoUrl && (
              <video
                src={activeVideoUrl}
                controls
                autoPlay
                style={{ width: "100%", height: "100%" }}
              />
            )}
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default PostSectionThree;
