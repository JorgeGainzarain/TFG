import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import App from "../App";
import Hero from "../components/Hero/Hero";
import FilterBar from "../components/FilterBar/FilterBar";
import AIRecommendations from "../components/AIRecommnedations/AIRecommendations";
import BookCard from "../components/BookCard/BookCard";
import TrendingBooks from "../components/TrendingBooks/TrendingBooks";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/App">
                <App/>
            </ComponentPreview>
            <ComponentPreview path="/Hero">
                <Hero/>
            </ComponentPreview>
            <ComponentPreview path="/FilterBar">
                <FilterBar/>
            </ComponentPreview>
            <ComponentPreview path="/AIRecommendations">
                <AIRecommendations/>
            </ComponentPreview>
            <ComponentPreview path="/BookCard">
                <BookCard/>
            </ComponentPreview>
            <ComponentPreview path="/TrendingBooks">
                <TrendingBooks/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews