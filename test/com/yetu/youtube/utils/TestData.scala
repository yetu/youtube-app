package com.yetu.youtube.utils

import play.api.libs.json.{JsValue, Json}

trait TestData {


  val jsonDummyValue: JsValue = Json parse """{"source":"453672727272"}"""

  val fakeValidJWTAccessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJ1c2VyVVVJRCI6InNvbWUtdXNlci1zdHJhbmdlLXV1aWQiLCJjbGllbnRJZCI6ImNvbS5hbm90aGVyLnRlc3QuYXBwLmlkIiwiaWF0IjoxNDI0MDkyNTkyLCJleHAiOjE3MzUxMzI1OTIsImF1ZCI6ImV2ZW50cyIsImlzcyI6Imh0dHBzOi8vYXV0aC55ZXR1ZGV2LmNvbSIsInN1YiI6InN1YmplY3Qud2l0aC5kb3RzIn0.Ia9ZYgG_V8h8c4iX0cHsL5e6wxWdsLJbI25eJNzmFa1PSsQyLMai_Q-vWXsQ83iURJsWrZxeCKih8qLKPu0z3K3A3NQV8K9qUHg8ItzaY-rsrRyF6G1eytmpsuvk5DA4fa8Yt-bkw1kChbY0Z7hzDe38a-ufwjRfTpy4Q2MZEFp_nxmKMlYF1y80yS6BysouQC1ad2PlyUrUKXBjleS1bRhmTlHBoG0S_yGGMHQ6u037Ref2yu8o0XNPWBMcqrW4UDhwZqoSWu0oPzytDHfboP_xgPnycbOQG0xK5UVplnA8n7iUK9k9PTPIs_ZHmHx73uQ_bBBbYTfhuNT2Ien1IvYXhtCW3QvNkIrnZY5stLXnpxy9FqA2WFRoN5qT40SIxC1Yd0aSpxlK34gkXWdw8JxBeYOJcusJZFm1ptUSKVoGecyeR3CxhMoGiWEf6hmQ3h4mpWwBmGEk25NT2a4d4qCheyhjsd464pNo4SmgRQ5sCt9UE5JATRRBnSAl6idYeKqAyFB89JYxpqHeOLnX-qD3unFQKgW-UdC7oFjm7R_DdKx0p_AjvEisjGpnGLHqPvMSlpprXGPLCZssCam_hYovAvdaHc7CAvJmkKqq5IFc4naN8G8ZSk_4VXkkTUIY3dJDIJMI7NcAB6HHu-1dPqsXfIV16qLJlStTWcFzKTQ"
}
