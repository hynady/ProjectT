package com.ticket.servermono.occacontext.infrastructure.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import com.ticket.servermono.occacontext.entities.Category;
import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.entities.OccaDetailInfo;
import com.ticket.servermono.occacontext.entities.Venue;
import com.ticket.servermono.occacontext.infrastructure.repositories.CategoryRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.VenueRepository;
import com.ticket.servermono.occacontext.usecases.OccaServices;
import com.ticket.servermono.occacontext.usecases.ShowServices;

import lombok.extern.slf4j.Slf4j;

import java.util.Arrays;
import java.util.Optional;

@Configuration
@Slf4j
public class OccaDataInitializer {

    @Bean
    @Order(2)
    CommandLineRunner initOccaData(OccaRepository repository, VenueRepository venueRepository,
            CategoryRepository categoryRepository, OccaServices occaServices, ShowServices showServices) {
        return args -> {
            if (repository.count() == 0) {

                Optional<Venue> svdHanoiVenue = venueRepository.findByLocation("SVĐ Mỹ Đình, Hà Nội");
                Optional<Venue> svdHcmVenue = venueRepository.findByLocation("SVĐ Quốc gia, TP.HCM");
                Optional<Category> musicCategory = categoryRepository.findByName("Âm nhạc");
                Optional<Category> sportCategory = categoryRepository.findByName("Thể thao");
                Optional<Category> festivalCategory = categoryRepository.findByName("Lễ hội");
                Optional<Category> experienceCategory = categoryRepository.findByName("Trải nghiệm");
                Optional<Category> entertainmentCategory = categoryRepository.findByName("Giải trí");

                if (svdHanoiVenue.isEmpty() || svdHcmVenue.isEmpty()) {
                    throw new RuntimeException("Required venues not found in database");
                }

                Occa[] occasions = {
                        Occa.builder()
                                .title("Concert Taylor Swift The Eras Tour")
                                .image("https://www.mensjournal.com/.image/ar_1.91%2Cc_fill%2Ccs_srgb%2Cg_faces:center%2Cq_auto:good%2Cw_1200/MjAxNTU2OTU1NTIzNzIwNTc3/taylor-swift-eras-tour-poster-2.png")
                                .artist("Taylor Swift")
                                .venue(svdHanoiVenue.get())
                                .category(musicCategory.get())
                                .build(),

                        Occa.builder()
                                .title("Coldplay Music Of The Spheres")
                                .image("https://www.bounceradio.ca/content/dam/audio/uploadImg/2024/10/11/1252x704coldplay22.png")
                                .artist("Coldplay")
                                .venue(svdHcmVenue.get())
                                .category(musicCategory.get())
                                .build(),

                        Occa.builder()
                                .title("Ed Sheeran World Tour 2025")
                                .image("https://static.toiimg.com/thumb/msid-115801253,width-1070,height-580,imgsize-140568,resizemode-75,overlay-toi_sw,pt-32,y_pad-40/photo.jpg")
                                .artist("Ed Sheeran")
                                .venue(svdHanoiVenue.get())
                                .category(musicCategory.get())
                                .build(),

                        Occa.builder()
                                .title("Adele Live in Concert")
                                .image("https://kenh14cdn.com/203336854389633024/2024/8/16/costpriceadelemunichconcer1720111990fea502e8progressive-17237877891221722276804.jpg")
                                .artist("Adele")
                                .venue(svdHcmVenue.get())
                                .category(musicCategory.get())
                                .build(),
                        Occa.builder()
                                .title("NBA All-Star Game 2025")
                                .image("https://assets.bigcartel.com/product_images/255024353/POST-NBA2020AllStarGame.jpg?auto=format&fit=max&w=1800")
                                .venue(svdHanoiVenue.get())
                                .category(sportCategory.get())
                                .build(),

                        Occa.builder()
                                .title("Katy Perry Las Vegas Residency")
                                .image("https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/dc123747-ce05-4205-8de2-5812937f4af9/dh4utme-5f86946b-f29f-42fa-af67-c40e29bb33fb.png/v1/fill/w_1091,h_732,q_70,strp/katy_perry___play_las_vegas__blu_ray__by_rodrigomndzz_dh4utme-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9ODU5IiwicGF0aCI6IlwvZlwvZGMxMjM3NDctY2UwNS00MjA1LThkZTItNTgxMjkzN2Y0YWY5XC9kaDR1dG1lLTVmODY5NDZiLWYyOWYtNDJmYS1hZjY3LWM0MGUyOWJiMzNmYi5wbmciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.0Jw7OyiFvm_yu36yZGdP_99UhW84BdChzhXQTB34H-Q")
                                .artist("Katy Perry")
                                .venue(svdHcmVenue.get())
                                .category(entertainmentCategory.get())
                                .build(),

                        Occa.builder()
                                .title("U2 - The Joshua Tree Tour 2025")
                                .image("https://bloximages.newyork1.vip.townnews.com/virginislandsdailynews.com/content/tncms/assets/v3/editorial/9/eb/9eb17314-f10f-5884-8fd9-b1284a20dce7/5927688706594.image.jpg?resize=1200%2C768")
                                .artist("U2")
                                .venue(svdHanoiVenue.get())
                                .category(musicCategory.get())
                                .build(),

                        Occa.builder()
                                .title("Shakira World Tour 2025")
                                .image("https://www.sofistadium.com/assets/img/865x566_Shakira_2025_Regional_SoFiStadium_0620-3d6a5dd11c.jpg")
                                .artist("Shakira")
                                .venue(svdHcmVenue.get())
                                .category(musicCategory.get())
                                .build(),

                        Occa.builder()
                                .title("8 Wonder Festival")
                                .image("https://static.vinwonders.com/production/top-5-trai-nghiem-khong-the-bo-lo-ngay-22-7-1.jpg")
                                .artist("Nhiều nghệ sĩ")
                                .venue(svdHanoiVenue.get())
                                .category(festivalCategory.get())
                                .build(),

                        Occa.builder()
                                .title("BTS World Tour 2025")
                                .image("https://i0.wp.com/annyeongoppa.com/wp-content/uploads/2019/01/img_3288.jpg?fit=1368%2C766&ssl=1")
                                .artist("BTS")
                                .venue(svdHanoiVenue.get())
                                .category(musicCategory.get())
                                .build(),

                        Occa.builder()
                                .title("The Phantom of the Opera - Broadway Show")
                                .image("https://res.klook.com/image/upload/c_fill,w_750,h_563/q_80/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3a/activities/ea25ft7t8qvbuooohmag.jpg")
                                .venue(svdHcmVenue.get())
                                .category(experienceCategory.get())
                                .build(),

                        Occa.builder()
                                .title("The Rolling Stones - Global Tour 2025")
                                .image("https://www.thinkfarm.co.uk/wp-content/uploads/2023/11/TF_StonesTour25_2.jpg")
                                .artist("The Rolling Stones")
                                .venue(svdHanoiVenue.get())
                                .category(musicCategory.get())
                                .build(),

                        Occa.builder()
                                .title("Cirque du Soleil - OVO")
                                .image("https://s1.ticketm.net/dam/a/98d/b4d6848b-d402-4346-96ce-bd7c2209198d_SOURCE")
                                .artist("OVO")
                                .venue(svdHcmVenue.get())
                                .category(entertainmentCategory.get())
                                .build()
                };

                // Save Occa entities first
                var savedOccas = repository.saveAll(Arrays.asList(occasions));

                // Create and save corresponding OccaDetailInfo for each Occa
                savedOccas.forEach(occa -> {
                    OccaDetailInfo detailInfo = OccaDetailInfo.builder()
                            .bannerUrl(occa.getImage()) // Using image as banner for now
                            .description("# The Artificial Paradise Tour 2025\r\n" + //
                                    "![The Artificial Paradise Tour 2025](https://salt.tkbcdn.com/ts/ds/f0/ca/7c/6e7dad78e37fd71064f8c6a957570bd1.jpg)\r\n"
                                    + //
                                    "\r\n" + //
                                    "### Event Description\r\n" + //
                                    "Join us for a special music night with BlackPink, featuring their most popular hit songs. Experience the thrill of live performances with a full band, meet the artists, and enjoy exclusive fan experiences.\r\n"
                                    + //
                                    "\r\n" + //
                                    "### Ticket Prices\r\n" + //
                                    "- **SVIP**: 3,500,000 VND (Available: 20)\r\n" + //
                                    "- **VIP**: 2,500,000 VND (Available: 50)\r\n" + //
                                    "- **Standard**: 1,500,000 VND (Available: 100)\r\n" + //
                                    "- **Economy**: 800,000 VND (Available: 200)\r\n" + //
                                    "\r\n" + //
                                    "### Event Highlights\r\n" + //
                                    "- Live performance with a full band\r\n" + //
                                    "- Meet and greet with the artists\r\n" + //
                                    "- Special gifts for the audience\r\n" + //
                                    "- Photo opportunity with the artists (SVIP)\r\n" + //
                                    "- Soundcheck party (VIP & SVIP)\r\n" + //
                                    "\r\n" + //
                                    "### Terms and Conditions\r\n" + //
                                    "- Tickets are non-refundable and non-exchangeable\r\n" + //
                                    "- Please arrive 30 minutes before the performance\r\n" + //
                                    "- Professional cameras are not allowed\r\n" + //
                                    "- Follow the event organizer's regulations" + occa.getTitle())
                            .organizer("VinGroup Entertainment")
                            .galleryUrls(Arrays.asList(
                                    occa.getImage(),
                                    "https://example.com/gallery1.jpg",
                                    "https://example.com/gallery2.jpg"))
                            .occa(occa)
                            .build();
                    occa.setDetailInfo(detailInfo);
                });

                // Save again to update the relationships
                repository.saveAll(savedOccas);
            }
        };
    }
}