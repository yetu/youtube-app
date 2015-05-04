package com.yetu.youtubeapp.controllers

import com.yetu.youtubeapp.utils.BaseSpec
import play.api.test.Helpers._


class HealthRouteSpec extends BaseSpec {

  val healthUrl = "/health"

  s"GET request on $healthUrl" must {
    "return a valid 200 response" in {

      val response = getRequestAuthenticated(healthUrl)
      status(response) mustEqual (OK)
      contentAsString(response) must include("alive")
    }

  }

}