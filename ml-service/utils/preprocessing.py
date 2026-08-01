"""
Preprocessing module.

Responsibilities:
- Clean satellite input data
- Handle missing values
- Prepare data for ML model
"""


def preprocess_satellite_data(data):

    """
    Input:

    {
        "nir":0.8,
        "red":0.2,
        "cloudCoverage":5,
        "imageUrl":"sample.png"
    }


    Output:

    {
        "nir":0.8,
        "red":0.2,
        "cloudCoverage":5
    }

    """


    # Extract satellite bands.
    #
    # The defaults match the ones predictor.predict_risk documents. They used
    # to be 0 here, which made a missing band collapse NDVI to 0.0 and report
    # a confident "High" risk for what was really absent data.

    nir = data.get(
        "nir",
        0.6
    )


    red = data.get(
        "red",
        0.2
    )


    # Cloud percentage.
    #
    # `cloudCover` is the key the Node backend has always sent; `cloudCoverage`
    # is the canonical one. Accept both so the value stops silently arriving
    # as 0 no matter which side of the boundary is out of date.
    cloud_coverage = data.get(
        "cloudCoverage",
        data.get("cloudCover", 0)
    )



    # Keep values within valid range

    nir = max(
        0,
        min(nir, 1)
    )


    red = max(
        0,
        min(red, 1)
    )


    cloud_coverage = max(
        0,
        min(cloud_coverage, 100)
    )



    processed_data = {

        "nir": nir,

        "red": red,

        "cloudCoverage": cloud_coverage

    }


    return processed_data
