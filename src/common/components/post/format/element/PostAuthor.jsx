import Link from "next/link";
import Image from 'next/image';

const PostAuthor = ({ dataAuthor }) => {
  if (!dataAuthor) {
    return null; // لو البيانات مش موجودة ما يعرضش حاجة
  }

  return (
    <div className="about-author">
      <div className="media">
        <div className="thumbnail">
          <Link href="#">
            <a>
              {dataAuthor.author_img ? (
                <Image
                  src={dataAuthor.author_img}
                  alt={dataAuthor.author_name || "Author Image"}
                  height={105}
                  width={105}
                />
              ) : (
                <div style={{ width: 105, height: 105, backgroundColor: '#ccc' }} /> // لو مفيش صورة يعرض مكان فارغ
              )}
            </a>
          </Link>
        </div>
        <div className="media-body">
          <div className="author-info">
            <h5 className="title">
              <Link href="#">
                <a className="hover-flip-item-wrapper">
                  <span className="hover-flip-item">
                    <span data-text={dataAuthor.author_name}>
                      {dataAuthor.author_name || "اسم المؤلف"}
                    </span>
                  </span>
                </a>
              </Link>
            </h5>
            <span className="b3 subtitle">
              {dataAuthor.author_designation || "المسمى الوظيفي غير متوفر"}
            </span>
          </div>
          <div className="content">
            <p className="b1 description">
              {dataAuthor.author_bio || "لا توجد نبذة عن المؤلف."}
            </p>
            <ul className="social-share-transparent size-md">
              {Array.isArray(dataAuthor.author_social) && dataAuthor.author_social.length > 0 ? (
                dataAuthor.author_social.map((social) => (
                  <li key={social.url}>
                    <a href={social.url}>
                      <i className={social.icon} />
                    </a>
                  </li>
                ))
              ) : (
                <li>لا توجد روابط تواصل اجتماعي</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostAuthor;
