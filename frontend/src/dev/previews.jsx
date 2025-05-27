import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import App from "../App";
import WelcomeMessage from "../components/WelcomeMessage/WelcomeMessage";
import FilterBar from "../components/FilterBar/FilterBar";
import AIRecommendations from "../components/AIRecommnedations/AIRecommendations";
import SearchPage from "../components/SearchPage/SearchPage";
import AuthOverlay from "../components/AuthOverlay/AuthOverlay";
import HorizontalBookCard from "../components/HorizontalBookCard/HorizontalBookCard";
import MobileNavbar from "../components/MobileNavbar/MobileNavbar";

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
            <ComponentPreview path="/HorizontalBookCard">
                <HorizontalBookCard/>
            </ComponentPreview>
            <ComponentPreview path="/MobileNavigation">
                <MobileNavbar/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews