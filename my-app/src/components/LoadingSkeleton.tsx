import "./LoadingSkeleton.css";

function LoadingSkeleton() {
    const skeletonCards = [1, 2, 3, 4, 5];
    return (
        <div className="recipeGrid">
            {
                skeletonCards.map((card) => (
                    <div className="skeletonCard" key={card}>
                        <div className="skeletonImage"></div>
                        <div className="skeletonText"></div>
                        <div className="skeletonTextSmall"></div>
                    </div>
                ))
            }

        </div>
    )
}
export default LoadingSkeleton;