"""
Request schema for POST /predict.

The backend has historically sent the cloud figure as `cloudCover` while this
service read `cloudCoverage`, so cloud coverage silently arrived as 0 in every
single prediction. Both spellings are accepted here via an alias so the
service stays correct regardless of which key the caller uses.
"""

from typing import Optional

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class SatelliteRequest(BaseModel):

    model_config = ConfigDict(
        populate_by_name=True,
        # The backend forwards the whole satellite payload (imageUrl, dates,
        # location, ...). Unknown keys are ignored rather than rejected.
        extra="ignore",
    )

    nir: float = Field(
        default=0.6,
        ge=0.0,
        le=1.0,
        description="Near-infrared reflectance",
    )

    red: float = Field(
        default=0.2,
        ge=0.0,
        le=1.0,
        description="Red band reflectance",
    )

    cloud_coverage: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        validation_alias=AliasChoices(
            "cloudCoverage",
            "cloudCover",
            "cloud_coverage",
        ),
        description="Cloud coverage percentage (0-100)",
    )

    image_url: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("imageUrl", "image_url"),
    )

    def to_features(self):

        """
        Flatten to the plain dict `preprocess_satellite_data` expects,
        using the canonical `cloudCoverage` key.
        """

        return {
            "nir": self.nir,
            "red": self.red,
            "cloudCoverage": self.cloud_coverage,
        }
