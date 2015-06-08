package app

import com.google.inject.Guice
import com.mohiva.play.silhouette.api.{Logger, SecuredSettings}
import controllers.routes
import com.yetu.play.authenticator.filters.AllowAllCorsFilter
import play.api.GlobalSettings
import play.api.i18n.{Lang, Messages}
import play.api.mvc.Results._
import play.api.mvc.{EssentialAction, RequestHeader, Result}
import com.yetu.play.authenticator.utils.di.{SilhouetteModule}

import scala.concurrent.Future
import com.yetu.play.authenticator.utils.di.YetuProvider

object Global extends Global

trait Global extends GlobalSettings with SecuredSettings with Logger {


  val injector = Guice.createInjector(new SilhouetteModule)

  override def getControllerInstance[A](controllerClass: Class[A]) = injector.getInstance(controllerClass)


   override def onNotAuthenticated(request: RequestHeader, lang: Lang): Option[Future[Result]] = {
    Some(Future.successful(Redirect(com.yetu.play.authenticator.controllers.routes.SocialAuthController.authenticate(YetuProvider.Yetu))))
  }

  override def doFilter(action: EssentialAction) = AllowAllCorsFilter(action)

}
