import UIKit
import WebKit
import UserNotifications

class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        let config = WKWebViewConfiguration()
        
        config.websiteDataStore = WKWebsiteDataStore.nonPersistent()

        webView = WKWebView(frame: self.view.frame, configuration: config)

        webView.navigationDelegate = self
        webView.uiDelegate = self
        
        self.view.addSubview(webView)

        if let url = URL(string: "https://deco.lkx666.cn") {
            let request = URLRequest(url: url)
            webView.load(request)
        }

        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                print("Notification permission granted.")
                self.scheduleDailyNotification()
            } else {
                print("Notification permission denied.")
                if let error = error {
                    print("Error requesting notification permission: \(error.localizedDescription)")
                }
            }
        }
    }
    
    func scheduleDailyNotification() {
        print("Scheduling daily notification...")
        
        var dateComponents = DateComponents()
        dateComponents.hour = 12
        dateComponents.minute = 30
        
        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        
        fetchEventData { (title, imageURL) in
            guard let title = title else {
                print("Failed to fetch event data.")
                return
            }
            
            let content = UNMutableNotificationContent()
            content.title = "Look for some fun events?"
            content.body = title
            content.sound = .default
            
            if let imageURL = imageURL, let url = URL(string: imageURL), let imageData = try? Data(contentsOf: url) {
                let tmpDir = NSTemporaryDirectory()
                let tmpFile = URL(fileURLWithPath: tmpDir).appendingPathComponent("event_image.jpg")
                try? imageData.write(to: tmpFile)
                
                if let attachment = try? UNNotificationAttachment(identifier: "eventImage", url: tmpFile, options: nil) {
                    content.attachments = [attachment]
                }
            }
            
            let request = UNNotificationRequest(identifier: "DailyEventNotification", content: content, trigger: trigger)
            
            UNUserNotificationCenter.current().add(request) { error in
                if let error = error {
                    print("Error adding notification: \(error.localizedDescription)")
                } else {
                    print("Notification scheduled successfully.")
                }
            }
        }
    }
    
    func fetchEventData(completion: @escaping (_ title: String?, _ imageURL: String?) -> Void) {
        let baseURL = "https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/brisbane-city-council-events/records?limit=1"
        let apiKey = "f0310fd20bd5ce96fc6cf14757ba1fe74fc110a278d74cc013e5dcce"
        
        var request = URLRequest(url: URL(string: baseURL)!)
        request.httpMethod = "GET"
        request.setValue("Apikey \(apiKey)", forHTTPHeaderField: "Authorization")
        
        URLSession.shared.dataTask(with: request) { (data, response, error) in
            if let error = error {
                print("Error fetching posts: \(error.localizedDescription)")
                completion(nil, nil)
                return
            }
            
            if let httpResponse = response as? HTTPURLResponse {
                print("HTTP Response Status Code: \(httpResponse.statusCode)")
            }
            
            guard let data = data else {
                print("No data received.")
                completion(nil, nil)
                return
            }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any],
                   let results = json["results"] as? [[String: Any]],
                   let firstEvent = results.first {
                    let title = firstEvent["subject"] as? String
                    let imageURL = firstEvent["eventimage"] as? String
                    print("Successfully parsed event data: Title - \(title ?? "No title"), ImageURL - \(imageURL ?? "No image URL")")
                    completion(title, imageURL)
                } else {
                    print("Failed to parse event data.")
                    completion(nil, nil)
                }
            } catch {
                print("Error parsing JSON: \(error.localizedDescription)")
                completion(nil, nil)
            }
        }.resume()
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url, url.scheme == "tel" {

            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            }
            decisionHandler(.cancel)
            return
        }
        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: "Sober Up", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default, handler: { _ in
            completionHandler()
        }))
        self.present(alert, animated: true, completion: nil)
    }
    
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = UIAlertController(title: "Confirm", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: { _ in
            completionHandler(false)
        }))
        alert.addAction(UIAlertAction(title: "OK", style: .default, handler: { _ in
            completionHandler(true)
        }))
        self.present(alert, animated: true, completion: nil)
    }
    
    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
        let alert = UIAlertController(title: "Prompt", message: prompt, preferredStyle: .alert)
        alert.addTextField { textField in
            textField.text = defaultText
        }
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: { _ in
            completionHandler(nil)
        }))
        alert.addAction(UIAlertAction(title: "OK", style: .default, handler: { _ in
            let text = alert.textFields?.first?.text
            completionHandler(text)
        }))
        self.present(alert, animated: true, completion: nil)
    }
}
