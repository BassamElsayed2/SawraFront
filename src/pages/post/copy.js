import { useRouter } from 'next/router';
import PostAuthor from '../../common/components/post/format/element/PostAuthor';
import PostMetaTwo from '../../common/components/post/format/element/PostMetaTwo';
import PostMetaOne from '../../common/components/post/format/element/PostMetaOne';

const NewsDetailsPage = ({ postData = {} }) => {
  const { locale } = useRouter();

  const basePathLink =
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_BASEPATH ?? ''
      : '';

  const featureImg = postData?.images?.[0] || '';

  const title = locale === 'ar' ? postData.title_ar : postData.title_en;
  const content = locale === 'ar' ? postData.content_ar : postData.content_en;
  const category =
    locale === 'ar' ? postData.category?.name_ar : postData.category?.name_en;

  const postContent =
    content?.replaceAll('/images/', basePathLink + '/images/') || '';

  const modifiedPostData = {
    ...postData,
    title,
    content: postContent,
    cate: category,
    featureImg,
    author_name: postData.publisher_name || 'بدون اسم',
    author_img: '/images/author-default.jpg',
    author_social: [],
    date: new Date(postData.created_at).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    post_views: '', // يمكنك إضافة عدد المشاهدات هنا إذا كان متاحًا
  };

  return (
    <>
      {featureImg ? <PostMetaOne metaData={modifiedPostData} /> : null}

      <div className="post-single-wrapper axil-section-gap bg-color-white">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <PostMetaTwo metaData={modifiedPostData} />
              <div className="axil-post-details">
                <div
                  className="post-details-content"
                  dangerouslySetInnerHTML={{ __html: postContent }}
                ></div>

                <PostAuthor dataAuthor={modifiedPostData} />
              </div>
            </div>
            {/* يمكنك إضافة الشريط الجانبي هنا إذا لزم الأمر */}
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsDetailsPage;
