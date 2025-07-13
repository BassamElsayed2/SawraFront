import Carousel from "react-bootstrap/Carousel";
import { getAds } from "../../../../services/apiAds";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
// import ExampleCarouselImage from "components/ExampleCarouselImage";

function SliderThree() {
  const { data: bannars } = useQuery({
    queryKey: ["ads"],
    queryFn: getAds,
  });

  console.log(bannars);

  return (
    <Carousel>
      {bannars?.map((banner) => (
        <Carousel.Item key={banner.id}>
          <Link href={banner.link || "#"}>
            <img
              className="d-block  "
              style={{
                objectFit: "cover",
                height: "244px",
                width: "1141px",
                margin: "auto",
              }}
              src={banner.image_url}
              alt={banner.title_en || "bannar"}
            />
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default SliderThree;
