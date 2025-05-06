import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import BookLabel from "../componentes/book";
import App from "../App";
import Home from "../componentes/home";
import ReviewLabel from "../componentes/review";
import Navbar from "../componentes/navbar";
import Search from "../componentes/search";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/BookLabel">
                <BookLabel/>
            </ComponentPreview>
            <ComponentPreview path="/App">
                <App/>
            </ComponentPreview>
            <ComponentPreview path="/Home">
                <Home/>
            </ComponentPreview>
            <ComponentPreview path="/ReviewLabel">
                <ReviewLabel/>
            </ComponentPreview>
            <ComponentPreview path="/Navbar">
                <Navbar/>
            </ComponentPreview>
            <ComponentPreview path="/Search">
                <Search/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews