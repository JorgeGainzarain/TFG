import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import App from "../App";
import WelcomeMessage from "../components/WelcomeMessage/WelcomeMessage";
import FilterBar from "../components/FilterBar/FilterBar";
import AIRecommendations from "../components/AIRecommnedations/AIRecommendations";
import SearchPage from "../components/SearchPage/SearchPage";
import AuthOverlay from "../components/AuthOverlay/AuthOverlay";
import MobileNavbar from "../components/MobileNavbar/MobileNavbar";
import BookCard from "../components/BookCard/BookCard";
import SearchResults from "../components/SearchResults/SearchResults";
import HomePage from "../pages/HomePage";
import ReviewsSection from "../components/ReviewsSection/ReviewsSection";
import BookDetails from "../components/BookDetails/BookDetails";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/App">
                <App/>
            </ComponentPreview>
            <ComponentPreview path="/Hero">
                <WelcomeMessage/>
            </ComponentPreview>
            <ComponentPreview path="/FilterBar">
                <FilterBar/>
            </ComponentPreview>
            <ComponentPreview path="/AIRecommendations">
                <AIRecommendations/>
            </ComponentPreview>
            <ComponentPreview path="/SearchPage">
                <SearchPage/>
            </ComponentPreview>
            <ComponentPreview path="/AuthOverlay">
                <AuthOverlay/>
            </ComponentPreview>
            <ComponentPreview path="/MobileNavigation">
                <MobileNavbar/>
            </ComponentPreview>
            <ComponentPreview path="/BookCard">
                <BookCard/>
            </ComponentPreview>
            <ComponentPreview path="/SearchResults">
                <SearchResults/>
            </ComponentPreview>
            <ComponentPreview path="/HomePage">
                <HomePage/>
            </ComponentPreview>
            <ComponentPreview path="/ReviewsSection">
                <ReviewsSection/>
            </ComponentPreview>
            <ComponentPreview path="/BookDetails">
                <BookDetails/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews