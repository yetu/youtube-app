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

/**
 * The global object.
 */
object Global extends Global

/**
 * The global configuration.
 */
trait Global extends GlobalSettings with SecuredSettings with Logger {

  /**
   * The Guice dependencies injector.
   */
  val injector = Guice.createInjector(new SilhouetteModule)

  /**
   * Loads the controller classes with the Guice injector,
   * in order to be able to inject dependencies directly into the controller.
   *
   * @param controllerClass The controller class to instantiate.
   * @return The instance of the controller class.
   * @throws Exception if the controller couldn't be instantiated.
   */
  override def getControllerInstance[A](controllerClass: Class[A]) = injector.getInstance(controllerClass)

  /**
   * Called when a user is not authenticated.
   *
   * As defined by RFC 2616, the status code of the response should be 401 Unauthorized.
   *
   * @param request The request header.
   * @param lang The currently selected language.
   * @return The result to send to the client.
   */
   override def onNotAuthenticated(request: RequestHeader, lang: Lang): Option[Future[Result]] = {
    Some(Future.successful(Redirect(com.yetu.play.authenticator.controllers.routes.SocialAuthController.authenticate(YetuProvider.Yetu))))
  }


  override def doFilter(action: EssentialAction) = AllowAllCorsFilter(action)

}
