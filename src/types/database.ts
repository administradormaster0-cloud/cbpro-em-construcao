export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string | null
          default_result_mode: string
          default_score_label: string
          genre: string
          is_visible: boolean
          logo_object_key: string
          max_roster_size: number
          min_roster_size: number
          name: string
          participant_type: string
          created_at: string
        }
        Insert: {
          id?: string | null
          default_result_mode: string
          default_score_label: string
          genre: string
          is_visible: boolean
          logo_object_key: string
          max_roster_size: number
          min_roster_size: number
          name: string
          participant_type: string
          created_at?: string
        }
        Update: {
          id?: string | null
          default_result_mode?: string
          default_score_label?: string
          genre?: string
          is_visible?: boolean
          logo_object_key?: string
          max_roster_size?: number
          min_roster_size?: number
          name?: string
          participant_type?: string
          created_at?: string
        }
      }
      platforms: {
        Row: {
          id: string | null
          key: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string | null
          key: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string | null
          key?: string
          name?: string
          created_at?: string
        }
      }
      game_platforms: {
        Row: {
          id: string | null
          game_id: string
          platform_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          game_id: string
          platform_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          game_id?: string
          platform_id?: string
          created_at?: string
        }
      }
      countries: {
        Row: {
          id: string | null
          iso2: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string | null
          iso2: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string | null
          iso2?: string
          name?: string
          created_at?: string
        }
      }
      states: {
        Row: {
          id: string | null
          code: string
          country_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string | null
          code: string
          country_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string | null
          code?: string
          country_id?: string
          name?: string
          created_at?: string
        }
      }
      plans: {
        Row: {
          id: string | null
          active: boolean
          ai_credits_monthly: number
          entity_type: string
          features_json: any
          name: string
          price_monthly: number
          price_yearly: number
          sort_order: number
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          tier: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          active: boolean
          ai_credits_monthly: number
          entity_type: string
          features_json: any
          name: string
          price_monthly: number
          price_yearly: number
          sort_order: number
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          tier: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          active?: boolean
          ai_credits_monthly?: number
          entity_type?: string
          features_json?: any
          name?: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          tier?: string
          updated_at?: string
          created_at?: string
        }
      }
      tiers: {
        Row: {
          id: string | null
          default_trophy_object_key: string | null
          key: string
          name: string
          rank: number
          created_at: string
        }
        Insert: {
          id?: string | null
          default_trophy_object_key?: string | null
          key: string
          name: string
          rank: number
          created_at?: string
        }
        Update: {
          id?: string | null
          default_trophy_object_key?: string | null
          key?: string
          name?: string
          rank?: number
          created_at?: string
        }
      }
      player_profiles: {
        Row: {
          id: string | null
          cod_position: number | null
          country_id: string
          game_id: string
          handle: string
          photo_object_key: string | null
          platform_handle: string
          platform_id: string
          position: string | null
          tier_id: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          cod_position?: number | null
          country_id: string
          game_id: string
          handle: string
          photo_object_key?: string | null
          platform_handle: string
          platform_id: string
          position?: string | null
          tier_id?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          cod_position?: number | null
          country_id?: string
          game_id?: string
          handle?: string
          photo_object_key?: string | null
          platform_handle?: string
          platform_id?: string
          position?: string | null
          tier_id?: string | null
          user_id?: string
          created_at?: string
        }
      }
      player_profile_change_logs: {
        Row: {
          id: string | null
          changed_by_user_id: string | null
          field_name: string
          new_value: string
          old_value: string
          player_profile_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          changed_by_user_id?: string | null
          field_name: string
          new_value: string
          old_value: string
          player_profile_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          changed_by_user_id?: string | null
          field_name?: string
          new_value?: string
          old_value?: string
          player_profile_id?: string
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string | null
          clubsId: number | null
          country_id: string
          eafc_club_members: any
          eafc_club_name: string | null
          eafc_club_platform: string | null
          emblem_object_key: string | null
          formation: string
          game_id: string
          lineup_assignments: any
          name: string
          owner_user_id: string
          tag: string | null
          tier_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          clubsId?: number | null
          country_id: string
          eafc_club_members: any
          eafc_club_name?: string | null
          eafc_club_platform?: string | null
          emblem_object_key?: string | null
          formation: string
          game_id: string
          lineup_assignments: any
          name: string
          owner_user_id: string
          tag?: string | null
          tier_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          clubsId?: number | null
          country_id?: string
          eafc_club_members?: any
          eafc_club_name?: string | null
          eafc_club_platform?: string | null
          emblem_object_key?: string | null
          formation?: string
          game_id?: string
          lineup_assignments?: any
          name?: string
          owner_user_id?: string
          tag?: string | null
          tier_id?: string
          created_at?: string
        }
      }
      team_players: {
        Row: {
          id: string | null
          player_profile_id: string
          role: string
          team_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          player_profile_id: string
          role: string
          team_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          player_profile_id?: string
          role?: string
          team_id?: string
          created_at?: string
        }
      }
      team_templates: {
        Row: {
          id: string | null
          credit_price: string | null
          description: string
          featured: boolean
          is_active: boolean
          is_exclusive_ultra: boolean
          is_premium: boolean
          name: string
          plan_required: string
          preview_image_key: string | null
          slug: string
          sort_order: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          credit_price?: string | null
          description: string
          featured: boolean
          is_active: boolean
          is_exclusive_ultra: boolean
          is_premium: boolean
          name: string
          plan_required: string
          preview_image_key?: string | null
          slug: string
          sort_order: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          credit_price?: string | null
          description?: string
          featured?: boolean
          is_active?: boolean
          is_exclusive_ultra?: boolean
          is_premium?: boolean
          name?: string
          plan_required?: string
          preview_image_key?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
          created_at?: string
        }
      }
      federations: {
        Row: {
          id: string | null
          contact: string | null
          country_id: string
          description: string | null
          is_platform: boolean
          is_verified: boolean
          logo_url: string | null
          name: string
          region: string | null
          short_name: string
          social_links: any
          website: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          contact?: string | null
          country_id: string
          description?: string | null
          is_platform: boolean
          is_verified: boolean
          logo_url?: string | null
          name: string
          region?: string | null
          short_name: string
          social_links: any
          website?: string | null
          created_at?: string
        }
        Update: {
          id?: string | null
          contact?: string | null
          country_id?: string
          description?: string | null
          is_platform?: boolean
          is_verified?: boolean
          logo_url?: string | null
          name?: string
          region?: string | null
          short_name?: string
          social_links?: any
          website?: string | null
          created_at?: string
        }
      }
      federation_followers: {
        Row: {
          id: string | null
          federation_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          federation_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          federation_id?: string
          user_id?: string
          created_at?: string
        }
      }
      federation_games: {
        Row: {
          id: string | null
          federation_id: string
          game_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          federation_id: string
          game_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          federation_id?: string
          game_id?: string
          created_at?: string
        }
      }
      federation_countries: {
        Row: {
          id: string | null
          country_id: string
          federation_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          country_id: string
          federation_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          country_id?: string
          federation_id?: string
          created_at?: string
        }
      }
      federation_customizations: {
        Row: {
          id: string | null
          accent_color: string
          bg_image_object_key: string | null
          federation_id: string
          hero_overlay_filter: string
          hero_overlay_opacity: number
          primary_color: string
          secondary_color: string
          social_discord: string
          social_facebook: string
          social_instagram: string
          social_tiktok: string
          social_twitter: string
          social_youtube: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          accent_color: string
          bg_image_object_key?: string | null
          federation_id: string
          hero_overlay_filter: string
          hero_overlay_opacity: number
          primary_color: string
          secondary_color: string
          social_discord: string
          social_facebook: string
          social_instagram: string
          social_tiktok: string
          social_twitter: string
          social_youtube: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          accent_color?: string
          bg_image_object_key?: string | null
          federation_id?: string
          hero_overlay_filter?: string
          hero_overlay_opacity?: number
          primary_color?: string
          secondary_color?: string
          social_discord?: string
          social_facebook?: string
          social_instagram?: string
          social_tiktok?: string
          social_twitter?: string
          social_youtube?: string
          updated_at?: string
          created_at?: string
        }
      }
      federation_gallery: {
        Row: {
          id: string | null
          album_id: string | null
          caption: string | null
          federation_id: string
          image_object_key: string
          uploaded_by_user_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          album_id?: string | null
          caption?: string | null
          federation_id: string
          image_object_key: string
          uploaded_by_user_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          album_id?: string | null
          caption?: string | null
          federation_id?: string
          image_object_key?: string
          uploaded_by_user_id?: string
          created_at?: string
        }
      }
      federation_blog_posts: {
        Row: {
          id: string | null
          author_user_id: string
          category: string
          content: string
          cover_image_object_key: string
          federation_id: string | null
          is_ai_generated: boolean
          player_profile_id: string | null
          published: boolean
          slug: string
          source: string
          subtitle: string | null
          tags: any | null
          team_id: string | null
          title: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          author_user_id: string
          category: string
          content: string
          cover_image_object_key: string
          federation_id?: string | null
          is_ai_generated: boolean
          player_profile_id?: string | null
          published: boolean
          slug: string
          source: string
          subtitle?: string | null
          tags?: any | null
          team_id?: string | null
          title: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          author_user_id?: string
          category?: string
          content?: string
          cover_image_object_key?: string
          federation_id?: string | null
          is_ai_generated?: boolean
          player_profile_id?: string | null
          published?: boolean
          slug?: string
          source?: string
          subtitle?: string | null
          tags?: any | null
          team_id?: string | null
          title?: string
          updated_at?: string
          created_at?: string
        }
      }
      federation_regulations: {
        Row: {
          id: string | null
          category: string
          content: string
          federation_id: string
          published: boolean
          template_id: string | null
          title: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          category: string
          content: string
          federation_id: string
          published: boolean
          template_id?: string | null
          title: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          category?: string
          content?: string
          federation_id?: string
          published?: boolean
          template_id?: string | null
          title?: string
          updated_at?: string
          created_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string | null
          accept_card: boolean
          accept_pix: boolean
          champion_entrant_id: string | null
          country_id: string
          created_by_user_id: string
          description: string | null
          easy_league_id: string | null
          elo_ranking_enabled: boolean
          ends_at: string | null
          entry_fee: number
          featured_credits_charged: number
          featured_until: string | null
          federation_id: string
          game_id: string
          is_easy_mode: boolean
          is_featured_home: boolean
          is_free: boolean
          is_special_edition: boolean
          logo_object_key: string | null
          max_registrations: number | null
          max_teams_per_user: number
          name: string
          participant_mode: string
          prizes_json: any
          ranking_season_id: string | null
          registration_close_at: string
          registration_open_at: string
          rules_overrides_json: any
          scope: string
          starts_at: string
          status: string
          transfer_window_status: string
          trophy_id: string | null
          trophy_image_object_key: string | null
          watermark_opacity: number
          watermark_scale: number
          created_at: string
        }
        Insert: {
          id?: string | null
          accept_card: boolean
          accept_pix: boolean
          champion_entrant_id?: string | null
          country_id: string
          created_by_user_id: string
          description?: string | null
          easy_league_id?: string | null
          elo_ranking_enabled: boolean
          ends_at?: string | null
          entry_fee: number
          featured_credits_charged: number
          featured_until?: string | null
          federation_id: string
          game_id: string
          is_easy_mode: boolean
          is_featured_home: boolean
          is_free: boolean
          is_special_edition: boolean
          logo_object_key?: string | null
          max_registrations?: number | null
          max_teams_per_user: number
          name: string
          participant_mode: string
          prizes_json: any
          ranking_season_id?: string | null
          registration_close_at: string
          registration_open_at: string
          rules_overrides_json: any
          scope: string
          starts_at: string
          status: string
          transfer_window_status: string
          trophy_id?: string | null
          trophy_image_object_key?: string | null
          watermark_opacity: number
          watermark_scale: number
          created_at?: string
        }
        Update: {
          id?: string | null
          accept_card?: boolean
          accept_pix?: boolean
          champion_entrant_id?: string | null
          country_id?: string
          created_by_user_id?: string
          description?: string | null
          easy_league_id?: string | null
          elo_ranking_enabled?: boolean
          ends_at?: string | null
          entry_fee?: number
          featured_credits_charged?: number
          featured_until?: string | null
          federation_id?: string
          game_id?: string
          is_easy_mode?: boolean
          is_featured_home?: boolean
          is_free?: boolean
          is_special_edition?: boolean
          logo_object_key?: string | null
          max_registrations?: number | null
          max_teams_per_user?: number
          name?: string
          participant_mode?: string
          prizes_json?: any
          ranking_season_id?: string | null
          registration_close_at?: string
          registration_open_at?: string
          rules_overrides_json?: any
          scope?: string
          starts_at?: string
          status?: string
          transfer_window_status?: string
          trophy_id?: string | null
          trophy_image_object_key?: string | null
          watermark_opacity?: number
          watermark_scale?: number
          created_at?: string
        }
      }
      tournament_stages: {
        Row: {
          id: string | null
          best_of_default: number
          result_mode: string
          rules_json: any
          stage_order: number
          stage_type: string
          standings_mode: string | null
          tournament_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          best_of_default: number
          result_mode: string
          rules_json: any
          stage_order: number
          stage_type: string
          standings_mode?: string | null
          tournament_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          best_of_default?: number
          result_mode?: string
          rules_json?: any
          stage_order?: number
          stage_type?: string
          standings_mode?: string | null
          tournament_id?: string
          created_at?: string
        }
      }
      tournament_allowed_tiers: {
        Row: {
          id: string | null
          tier_id: string
          tournament_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          tier_id: string
          tournament_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          tier_id?: string
          tournament_id?: string
          created_at?: string
        }
      }
      tournament_messenger_config: {
        Row: {
          id: string | null
          enabled: boolean
          game_id: string
          tournament_type: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          enabled: boolean
          game_id: string
          tournament_type: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          enabled?: boolean
          game_id?: string
          tournament_type?: string
          updated_at?: string
          created_at?: string
        }
      }
      entrants: {
        Row: {
          id: string | null
          easy_custom_team_id: string | null
          player_profile_id: string | null
          seed: string | null
          team_id: string | null
          tournament_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          easy_custom_team_id?: string | null
          player_profile_id?: string | null
          seed?: string | null
          team_id?: string | null
          tournament_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          easy_custom_team_id?: string | null
          player_profile_id?: string | null
          seed?: string | null
          team_id?: string | null
          tournament_id?: string
          created_at?: string
        }
      }
      stage_groups: {
        Row: {
          id: string | null
          name: string
          stage_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          name: string
          stage_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          name?: string
          stage_id?: string
          created_at?: string
        }
      }
      stage_standings: {
        Row: {
          id: string | null
          draws: number
          entrant_id: string
          group_id: string | null
          losses: number
          played: number
          points: number
          position: number | null
          score_against: number
          score_diff: number
          score_for: number
          stage_id: string
          wins: number
          created_at: string
        }
        Insert: {
          id?: string | null
          draws: number
          entrant_id: string
          group_id?: string | null
          losses: number
          played: number
          points: number
          position?: number | null
          score_against: number
          score_diff: number
          score_for: number
          stage_id: string
          wins: number
          created_at?: string
        }
        Update: {
          id?: string | null
          draws?: number
          entrant_id?: string
          group_id?: string | null
          losses?: number
          played?: number
          points?: number
          position?: number | null
          score_against?: number
          score_diff?: number
          score_for?: number
          stage_id?: string
          wins?: number
          created_at?: string
        }
      }
      group_entrants: {
        Row: {
          id: string | null
          entrant_id: string
          stage_group_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          entrant_id: string
          stage_group_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          entrant_id?: string
          stage_group_id?: string
          created_at?: string
        }
      }
      bracket_display_config: {
        Row: {
          id: string | null
          card_border_radius: number
          card_width: number
          connector_gap: number
          emblem_img_size: number
          emblem_size: number
          font_size_name: number
          font_size_round_header: number
          font_size_score: number
          font_size_vs: number
          glow_intensity: number
          show_game_expand: boolean
          show_glow_effects: boolean
          show_md_label: boolean
          show_schedule: boolean
          show_status_bar: boolean
          standings_emblem_size: number
          standings_font_size: number
          standings_show_advance_zone: boolean
          standings_show_plan_badge: boolean
          standings_show_points_bar: boolean
          updated_at: string
        }
        Insert: {
          id?: string | null
          card_border_radius: number
          card_width: number
          connector_gap: number
          emblem_img_size: number
          emblem_size: number
          font_size_name: number
          font_size_round_header: number
          font_size_score: number
          font_size_vs: number
          glow_intensity: number
          show_game_expand: boolean
          show_glow_effects: boolean
          show_md_label: boolean
          show_schedule: boolean
          show_status_bar: boolean
          standings_emblem_size: number
          standings_font_size: number
          standings_show_advance_zone: boolean
          standings_show_plan_badge: boolean
          standings_show_points_bar: boolean
          updated_at?: string
        }
        Update: {
          id?: string | null
          card_border_radius?: number
          card_width?: number
          connector_gap?: number
          emblem_img_size?: number
          emblem_size?: number
          font_size_name?: number
          font_size_round_header?: number
          font_size_score?: number
          font_size_vs?: number
          glow_intensity?: number
          show_game_expand?: boolean
          show_glow_effects?: boolean
          show_md_label?: boolean
          show_schedule?: boolean
          show_status_bar?: boolean
          standings_emblem_size?: number
          standings_font_size?: number
          standings_show_advance_zone?: boolean
          standings_show_plan_badge?: boolean
          standings_show_points_bar?: boolean
          updated_at?: string
        }
      }
      match_series: {
        Row: {
          id: string | null
          best_of: number
          bracket_round_id: string | null
          entrant_a_id: string
          entrant_b_id: string
          group_id: string | null
          scheduled_at: string | null
          stage_id: string
          status: string
          winner_entrant_id: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          best_of: number
          bracket_round_id?: string | null
          entrant_a_id: string
          entrant_b_id: string
          group_id?: string | null
          scheduled_at?: string | null
          stage_id: string
          status: string
          winner_entrant_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string | null
          best_of?: number
          bracket_round_id?: string | null
          entrant_a_id?: string
          entrant_b_id?: string
          group_id?: string | null
          scheduled_at?: string | null
          stage_id?: string
          status?: string
          winner_entrant_id?: string | null
          created_at?: string
        }
      }
      series_games: {
        Row: {
          id: string | null
          decided_by: string | null
          game_number: number
          placement_a: string | null
          placement_b: string | null
          scheduled_at: string
          score_a: number | null
          score_b: number | null
          series_id: string
          status: string
          tiebreak_score_a: number | null
          tiebreak_score_b: number | null
          winner_entrant_id: string | null
          created_at: string
        }
        Insert: {
          id?: string | null
          decided_by?: string | null
          game_number: number
          placement_a?: string | null
          placement_b?: string | null
          scheduled_at: string
          score_a?: number | null
          score_b?: number | null
          series_id: string
          status: string
          tiebreak_score_a?: number | null
          tiebreak_score_b?: number | null
          winner_entrant_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string | null
          decided_by?: string | null
          game_number?: number
          placement_a?: string | null
          placement_b?: string | null
          scheduled_at?: string
          score_a?: number | null
          score_b?: number | null
          series_id?: string
          status?: string
          tiebreak_score_a?: number | null
          tiebreak_score_b?: number | null
          winner_entrant_id?: string | null
          created_at?: string
        }
      }
      match_eafc_links: {
        Row: {
          id: string | null
          created_by: string
          eafc_match_id: number
          game_id: string
          internal_match_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          created_by: string
          eafc_match_id: number
          game_id: string
          internal_match_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          created_by?: string
          eafc_match_id?: number
          game_id?: string
          internal_match_id?: string
          created_at?: string
        }
      }
      match_eafc_newgen_player_stats: {
        Row: {
          id: string | null
          assists: number
          club_id: number
          goals: number
          goals_conceded: number
          internal_match_id: string
          mom: boolean
          pass_attempts: number
          passes_made: number
          platform_handle: string
          player_ea_id: number | null
          player_profile_id: string | null
          pos: string | null
          rating: number
          raw_player_json: any | null
          redcards: number
          saves: number
          seconds_played: number
          shots: number
          tackle_attempts: number
          tackles_made: number
          team_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          assists: number
          club_id: number
          goals: number
          goals_conceded: number
          internal_match_id: string
          mom: boolean
          pass_attempts: number
          passes_made: number
          platform_handle: string
          player_ea_id?: number | null
          player_profile_id?: string | null
          pos?: string | null
          rating: number
          raw_player_json?: any | null
          redcards: number
          saves: number
          seconds_played: number
          shots: number
          tackle_attempts: number
          tackles_made: number
          team_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          assists?: number
          club_id?: number
          goals?: number
          goals_conceded?: number
          internal_match_id?: string
          mom?: boolean
          pass_attempts?: number
          passes_made?: number
          platform_handle?: string
          player_ea_id?: number | null
          player_profile_id?: string | null
          pos?: string | null
          rating?: number
          raw_player_json?: any | null
          redcards?: number
          saves?: number
          seconds_played?: number
          shots?: number
          tackle_attempts?: number
          tackles_made?: number
          team_id?: string
          created_at?: string
        }
      }
      match_eafc_newgen_team_stats: {
        Row: {
          id: string | null
          club_id: number
          goals: number
          goals_against: number
          internal_match_id: string
          pass_attempts: number
          passes_made: number
          rating_sum: number
          raw_aggregate_json: any | null
          saves: number
          shots: number
          side: string
          tackle_attempts: number
          tackles_made: number
          team_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          club_id: number
          goals: number
          goals_against: number
          internal_match_id: string
          pass_attempts: number
          passes_made: number
          rating_sum: number
          raw_aggregate_json?: any | null
          saves: number
          shots: number
          side: string
          tackle_attempts: number
          tackles_made: number
          team_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          club_id?: number
          goals?: number
          goals_against?: number
          internal_match_id?: string
          pass_attempts?: number
          passes_made?: number
          rating_sum?: number
          raw_aggregate_json?: any | null
          saves?: number
          shots?: number
          side?: string
          tackle_attempts?: number
          tackles_made?: number
          team_id?: string
          created_at?: string
        }
      }
      elo_federation_seasons: {
        Row: {
          id: string | null
          current_config_version_id: string
          federation_id: string
          previous_federation_season_id: string | null
          season_id: string
          status: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          current_config_version_id: string
          federation_id: string
          previous_federation_season_id?: string | null
          season_id: string
          status: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          current_config_version_id?: string
          federation_id?: string
          previous_federation_season_id?: string | null
          season_id?: string
          status?: string
          updated_at?: string
          created_at?: string
        }
      }
      elo_season_teams: {
        Row: {
          id: string | null
          draws: number
          elo_rating: number
          federation_season_id: string
          losses: number
          matches_played: number
          season_tier_id: string
          status: string
          team_id: string
          tier_position: number
          wins: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          draws: number
          elo_rating: number
          federation_season_id: string
          losses: number
          matches_played: number
          season_tier_id: string
          status: string
          team_id: string
          tier_position: number
          wins: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          draws?: number
          elo_rating?: number
          federation_season_id?: string
          losses?: number
          matches_played?: number
          season_tier_id?: string
          status?: string
          team_id?: string
          tier_position?: number
          wins?: number
          updated_at?: string
          created_at?: string
        }
      }
      elo_season_tiers: {
        Row: {
          id: string | null
          active: boolean
          code: string
          federation_season_id: string
          name: string
          rank: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          active: boolean
          code: string
          federation_season_id: string
          name: string
          rank: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          active?: boolean
          code?: string
          federation_season_id?: string
          name?: string
          rank?: number
          updated_at?: string
          created_at?: string
        }
      }
      elo_tier_version_rules: {
        Row: {
          id: string | null
          config_version_id: string
          floor_elo: number | null
          initial_elo: number
          max_teams: number | null
          promotion_spots: number
          relegation_spots: number
          season_tier_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          config_version_id: string
          floor_elo?: number | null
          initial_elo: number
          max_teams?: number | null
          promotion_spots: number
          relegation_spots: number
          season_tier_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          config_version_id?: string
          floor_elo?: number | null
          initial_elo?: number
          max_teams?: number | null
          promotion_spots?: number
          relegation_spots?: number
          season_tier_id?: string
          created_at?: string
        }
      }
      ranking_seasons: {
        Row: {
          id: string | null
          ends_at: string
          game_id: string
          is_active: boolean
          name: string
          starts_at: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          ends_at: string
          game_id: string
          is_active: boolean
          name: string
          starts_at: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          ends_at?: string
          game_id?: string
          is_active?: boolean
          name?: string
          starts_at?: string
          updated_at?: string
          created_at?: string
        }
      }
      ranking_hub_cards: {
        Row: {
          id: string | null
          description: string
          icon_name: string
          is_active: boolean
          route: string
          sort_order: number
          title: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          description: string
          icon_name: string
          is_active: boolean
          route: string
          sort_order: number
          title: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          description?: string
          icon_name?: string
          is_active?: boolean
          route?: string
          sort_order?: number
          title?: string
          updated_at?: string
          created_at?: string
        }
      }
      ranked_profiles: {
        Row: {
          id: string | null
          best_streak: number
          country_id: string | null
          draws: number
          elo_rating: number
          game_id: string
          last_match_at: string | null
          losses: number
          matches_played: number
          mode: string
          team_id: string | null
          tier: string
          user_id: string | null
          win_streak: number
          wins: number
          created_at: string
        }
        Insert: {
          id?: string | null
          best_streak: number
          country_id?: string | null
          draws: number
          elo_rating: number
          game_id: string
          last_match_at?: string | null
          losses: number
          matches_played: number
          mode: string
          team_id?: string | null
          tier: string
          user_id?: string | null
          win_streak: number
          wins: number
          created_at?: string
        }
        Update: {
          id?: string | null
          best_streak?: number
          country_id?: string | null
          draws?: number
          elo_rating?: number
          game_id?: string
          last_match_at?: string | null
          losses?: number
          matches_played?: number
          mode?: string
          team_id?: string | null
          tier?: string
          user_id?: string | null
          win_streak?: number
          wins?: number
          created_at?: string
        }
      }
      ranked_seasons: {
        Row: {
          id: string | null
          ends_at: string
          game_id: string
          is_active: boolean
          name: string
          reset_elo: number
          season_type: string
          slug: string
          soft_reset_percent: number
          source: string
          starts_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          ends_at: string
          game_id: string
          is_active: boolean
          name: string
          reset_elo: number
          season_type: string
          slug: string
          soft_reset_percent: number
          source: string
          starts_at: string
          created_at?: string
        }
        Update: {
          id?: string | null
          ends_at?: string
          game_id?: string
          is_active?: boolean
          name?: string
          reset_elo?: number
          season_type?: string
          slug?: string
          soft_reset_percent?: number
          source?: string
          starts_at?: string
          created_at?: string
        }
      }
      fantasy_league_members: {
        Row: {
          id: string | null
          budget_remaining: number
          joined_at: string
          league_id: string
          rank: string | null
          round_points: number
          total_points: number
          user_id: string
        }
        Insert: {
          id?: string | null
          budget_remaining: number
          joined_at: string
          league_id: string
          rank?: string | null
          round_points: number
          total_points: number
          user_id: string
        }
        Update: {
          id?: string | null
          budget_remaining?: number
          joined_at?: string
          league_id?: string
          rank?: string | null
          round_points?: number
          total_points?: number
          user_id?: string
        }
      }
      fantasy_teams: {
        Row: {
          id: string | null
          coins: number
          division: string
          game_id: string
          logo_url: string | null
          streak_count: number
          streak_type: string | null
          team_name: string
          total_points: number
          user_id: string
          xp: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          coins: number
          division: string
          game_id: string
          logo_url?: string | null
          streak_count: number
          streak_type?: string | null
          team_name: string
          total_points: number
          user_id: string
          xp: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          coins?: number
          division?: string
          game_id?: string
          logo_url?: string | null
          streak_count?: number
          streak_type?: string | null
          team_name?: string
          total_points?: number
          user_id?: string
          xp?: number
          updated_at?: string
          created_at?: string
        }
      }
      fantasy_lineups: {
        Row: {
          id: string | null
          captain_player_id: string | null
          formation: string
          is_locked: boolean
          league_id: string
          round_number: number
          total_points: number
          total_value: number
          tournament_id: string
          user_id: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          captain_player_id?: string | null
          formation: string
          is_locked: boolean
          league_id: string
          round_number: number
          total_points: number
          total_value: number
          tournament_id: string
          user_id: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          captain_player_id?: string | null
          formation?: string
          is_locked?: boolean
          league_id?: string
          round_number?: number
          total_points?: number
          total_value?: number
          tournament_id?: string
          user_id?: string
          updated_at?: string
          created_at?: string
        }
      }
      fantasy_lineup_players: {
        Row: {
          id: string | null
          fantasy_points: number
          is_captain: boolean
          lineup_id: string
          player_profile_id: string
          position_slot: string
          purchase_value: number
          created_at: string
        }
        Insert: {
          id?: string | null
          fantasy_points: number
          is_captain: boolean
          lineup_id: string
          player_profile_id: string
          position_slot: string
          purchase_value: number
          created_at?: string
        }
        Update: {
          id?: string | null
          fantasy_points?: number
          is_captain?: boolean
          lineup_id?: string
          player_profile_id?: string
          position_slot?: string
          purchase_value?: number
          created_at?: string
        }
      }
      fantasy_player_values: {
        Row: {
          id: string | null
          average_points: number
          game_id: string
          last_match_points: number
          market_value: number
          matches_played: number
          player_profile_id: string
          previous_value: number
          streak_count: number
          streak_type: string
          total_fantasy_points: number
          volatility_factor: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          average_points: number
          game_id: string
          last_match_points: number
          market_value: number
          matches_played: number
          player_profile_id: string
          previous_value: number
          streak_count: number
          streak_type: string
          total_fantasy_points: number
          volatility_factor: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          average_points?: number
          game_id?: string
          last_match_points?: number
          market_value?: number
          matches_played?: number
          player_profile_id?: string
          previous_value?: number
          streak_count?: number
          streak_type?: string
          total_fantasy_points?: number
          volatility_factor?: number
          updated_at?: string
          created_at?: string
        }
      }
      fantasy_rounds: {
        Row: {
          id: string | null
          end_date: string
          game_id: string
          name: string
          round_number: number
          start_date: string
          status: string
          tournament_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          end_date: string
          game_id: string
          name: string
          round_number: number
          start_date: string
          status: string
          tournament_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          end_date?: string
          game_id?: string
          name?: string
          round_number?: number
          start_date?: string
          status?: string
          tournament_id?: string
          created_at?: string
        }
      }
      fantasy_scoring_config: {
        Row: {
          id: string | null
          captain_multiplier: number
          game_id: string
          market_factor: number
          max_daily_change_pct: number
          min_floor_value: number
          position_weights: any
          pts_assist: number
          pts_draw: number
          pts_goal: number
          pts_loss: number
          pts_mvp: number
          pts_pass: number
          pts_save: number
          pts_shot: number
          pts_tackle: number
          pts_victory: number
          rating_high_bonus: number
          rating_high_threshold: number
          rating_low_penalty: number
          rating_low_threshold: number
          rating_mid_bonus: number
          rating_mid_threshold: number
          streak_bonus_pct: number
          tier_multipliers: any
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          captain_multiplier: number
          game_id: string
          market_factor: number
          max_daily_change_pct: number
          min_floor_value: number
          position_weights: any
          pts_assist: number
          pts_draw: number
          pts_goal: number
          pts_loss: number
          pts_mvp: number
          pts_pass: number
          pts_save: number
          pts_shot: number
          pts_tackle: number
          pts_victory: number
          rating_high_bonus: number
          rating_high_threshold: number
          rating_low_penalty: number
          rating_low_threshold: number
          rating_mid_bonus: number
          rating_mid_threshold: number
          streak_bonus_pct: number
          tier_multipliers: any
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          captain_multiplier?: number
          game_id?: string
          market_factor?: number
          max_daily_change_pct?: number
          min_floor_value?: number
          position_weights?: any
          pts_assist?: number
          pts_draw?: number
          pts_goal?: number
          pts_loss?: number
          pts_mvp?: number
          pts_pass?: number
          pts_save?: number
          pts_shot?: number
          pts_tackle?: number
          pts_victory?: number
          rating_high_bonus?: number
          rating_high_threshold?: number
          rating_low_penalty?: number
          rating_low_threshold?: number
          rating_mid_bonus?: number
          rating_mid_threshold?: number
          streak_bonus_pct?: number
          tier_multipliers?: any
          updated_at?: string
          created_at?: string
        }
      }
      fantasy_achievements: {
        Row: {
          id: string | null
          category: string
          coin_bonus: number
          description: string
          game_id: string | null
          glow_color: string
          icon: string
          is_active: boolean
          is_seasonal: boolean
          name: string
          rarity: string
          repeatable: boolean
          sort_order: number
          unlock_condition: any
          xp_bonus: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          category: string
          coin_bonus: number
          description: string
          game_id?: string | null
          glow_color: string
          icon: string
          is_active: boolean
          is_seasonal: boolean
          name: string
          rarity: string
          repeatable: boolean
          sort_order: number
          unlock_condition: any
          xp_bonus: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          category?: string
          coin_bonus?: number
          description?: string
          game_id?: string | null
          glow_color?: string
          icon?: string
          is_active?: boolean
          is_seasonal?: boolean
          name?: string
          rarity?: string
          repeatable?: boolean
          sort_order?: number
          unlock_condition?: any
          xp_bonus?: number
          updated_at?: string
          created_at?: string
        }
      }
      fantasy_player_achievements: {
        Row: {
          id: string | null
          achievement_id: string
          coins_awarded: number
          match_id: string | null
          player_profile_id: string
          tournament_id: string | null
          unlocked_at: string
          xp_awarded: number
        }
        Insert: {
          id?: string | null
          achievement_id: string
          coins_awarded: number
          match_id?: string | null
          player_profile_id: string
          tournament_id?: string | null
          unlocked_at: string
          xp_awarded: number
        }
        Update: {
          id?: string | null
          achievement_id?: string
          coins_awarded?: number
          match_id?: string | null
          player_profile_id?: string
          tournament_id?: string | null
          unlocked_at?: string
          xp_awarded?: number
        }
      }
      avatar_gallery: {
        Row: {
          id: string | null
          display_name: string
          image_object_key: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          display_name: string
          image_object_key: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          display_name?: string
          image_object_key?: string
          user_id?: string
          created_at?: string
        }
      }
      avatar_frames: {
        Row: {
          id: string | null
          animation_css: string | null
          frame_image_url: string | null
          is_active: boolean
          is_animated: boolean
          is_limited: boolean
          max_supply: string | null
          name: string
          price_credits: number
          rarity: string
          slug: string
          sold_count: number
          sort_order: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          animation_css?: string | null
          frame_image_url?: string | null
          is_active: boolean
          is_animated: boolean
          is_limited: boolean
          max_supply?: string | null
          name: string
          price_credits: number
          rarity: string
          slug: string
          sold_count: number
          sort_order: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          animation_css?: string | null
          frame_image_url?: string | null
          is_active?: boolean
          is_animated?: boolean
          is_limited?: boolean
          max_supply?: string | null
          name?: string
          price_credits?: number
          rarity?: string
          slug?: string
          sold_count?: number
          sort_order?: number
          updated_at?: string
          created_at?: string
        }
      }
      avatar_nfts: {
        Row: {
          id: string | null
          creator_user_id: string
          display_name: string
          image_object_key: string
          mint_number: number
          owner_user_id: string
          style_key: string
          total_owners: number
          tournament_wins: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          creator_user_id: string
          display_name: string
          image_object_key: string
          mint_number: number
          owner_user_id: string
          style_key: string
          total_owners: number
          tournament_wins: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          creator_user_id?: string
          display_name?: string
          image_object_key?: string
          mint_number?: number
          owner_user_id?: string
          style_key?: string
          total_owners?: number
          tournament_wins?: number
          updated_at?: string
          created_at?: string
        }
      }
      avatar_listings: {
        Row: {
          id: string | null
          min_price_credits: number
          nft_id: string
          price_credits: number
          seller_user_id: string
          sold_at: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string | null
          min_price_credits: number
          nft_id: string
          price_credits: number
          seller_user_id: string
          sold_at?: string | null
          status: string
          created_at?: string
        }
        Update: {
          id?: string | null
          min_price_credits?: number
          nft_id?: string
          price_credits?: number
          seller_user_id?: string
          sold_at?: string | null
          status?: string
          created_at?: string
        }
      }
      avatar_trades: {
        Row: {
          id: string | null
          buyer_user_id: string
          listing_id: string
          nft_id: string
          platform_fee: number
          price_credits: number
          seller_received: number
          seller_user_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          buyer_user_id: string
          listing_id: string
          nft_id: string
          platform_fee: number
          price_credits: number
          seller_received: number
          seller_user_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          buyer_user_id?: string
          listing_id?: string
          nft_id?: string
          platform_fee?: number
          price_credits?: number
          seller_received?: number
          seller_user_id?: string
          created_at?: string
        }
      }
      avatar_style_limits: {
        Row: {
          id: string | null
          current_supply: number
          max_supply: number
          style_key: string
          created_at: string
        }
        Insert: {
          id?: string | null
          current_supply: number
          max_supply: number
          style_key: string
          created_at?: string
        }
        Update: {
          id?: string | null
          current_supply?: number
          max_supply?: number
          style_key?: string
          created_at?: string
        }
      }
      cosmetics: {
        Row: {
          id: string | null
          animation_url: string | null
          collection_id: string
          is_active: boolean
          name: string
          preview_url: string | null
          price_credits: number
          rarity: string
          sort_order: number
          type: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          animation_url?: string | null
          collection_id: string
          is_active: boolean
          name: string
          preview_url?: string | null
          price_credits: number
          rarity: string
          sort_order: number
          type: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          animation_url?: string | null
          collection_id?: string
          is_active?: boolean
          name?: string
          preview_url?: string | null
          price_credits?: number
          rarity?: string
          sort_order?: number
          type?: string
          updated_at?: string
          created_at?: string
        }
      }
      cosmetic_collections: {
        Row: {
          id: string | null
          is_limited: boolean
          max_supply: number | null
          name: string
          rarity: string
          slug: string
          sold_count: number
          theme_color: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          is_limited: boolean
          max_supply?: number | null
          name: string
          rarity: string
          slug: string
          sold_count: number
          theme_color: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          is_limited?: boolean
          max_supply?: number | null
          name?: string
          rarity?: string
          slug?: string
          sold_count?: number
          theme_color?: string
          updated_at?: string
          created_at?: string
        }
      }
      cosmetic_bundles: {
        Row: {
          id: string | null
          bundle_tier: string
          collection_id: string
          discount_pct: number
          is_active: boolean
          name: string
          price_credits: number
          created_at: string
        }
        Insert: {
          id?: string | null
          bundle_tier: string
          collection_id: string
          discount_pct: number
          is_active: boolean
          name: string
          price_credits: number
          created_at?: string
        }
        Update: {
          id?: string | null
          bundle_tier?: string
          collection_id?: string
          discount_pct?: number
          is_active?: boolean
          name?: string
          price_credits?: number
          created_at?: string
        }
      }
      cosmetic_bundle_items: {
        Row: {
          id: string | null
          bundle_id: string
          cosmetic_id: string
        }
        Insert: {
          id?: string | null
          bundle_id: string
          cosmetic_id: string
        }
        Update: {
          id?: string | null
          bundle_id?: string
          cosmetic_id?: string
        }
      }
      combo_effects: {
        Row: {
          id: string | null
          badge_color: string
          badge_label: string
          collection_id: string
          combo_tier: string
          effect_animation_url: string | null
          effect_css: string
          effect_type: string
          required_count: number
          created_at: string
        }
        Insert: {
          id?: string | null
          badge_color: string
          badge_label: string
          collection_id: string
          combo_tier: string
          effect_animation_url?: string | null
          effect_css: string
          effect_type: string
          required_count: number
          created_at?: string
        }
        Update: {
          id?: string | null
          badge_color?: string
          badge_label?: string
          collection_id?: string
          combo_tier?: string
          effect_animation_url?: string | null
          effect_css?: string
          effect_type?: string
          required_count?: number
          created_at?: string
        }
      }
      credit_packages: {
        Row: {
          id: string | null
          active: boolean
          credits: number
          currency: string
          label: string
          popular: boolean
          price_cents: number
          stripe_price_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          active: boolean
          credits: number
          currency: string
          label: string
          popular: boolean
          price_cents: number
          stripe_price_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          active?: boolean
          credits?: number
          currency?: string
          label?: string
          popular?: boolean
          price_cents?: number
          stripe_price_id?: string
          created_at?: string
        }
      }
      ai_feature_costs: {
        Row: {
          id: string | null
          active: boolean
          credit_cost: number
          feature_key: string
          feature_label: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          active: boolean
          credit_cost: number
          feature_key: string
          feature_label: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          active?: boolean
          credit_cost?: number
          feature_key?: string
          feature_label?: string
          updated_at?: string
          created_at?: string
        }
      }
      field_edit_costs: {
        Row: {
          id: string | null
          active: boolean
          credit_cost: number
          entity_type: string
          field_key: string
          field_label: string
          free_edit_count: number
          free_edit_mode: string
          free_edit_period_days: number | null
          renews_per_season: boolean
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          active: boolean
          credit_cost: number
          entity_type: string
          field_key: string
          field_label: string
          free_edit_count: number
          free_edit_mode: string
          free_edit_period_days?: number | null
          renews_per_season: boolean
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          active?: boolean
          credit_cost?: number
          entity_type?: string
          field_key?: string
          field_label?: string
          free_edit_count?: number
          free_edit_mode?: string
          free_edit_period_days?: number | null
          renews_per_season?: boolean
          updated_at?: string
          created_at?: string
        }
      }
      messenger_theme: {
        Row: {
          id: string | null
          accent_color: string
          bubble_received_color: string
          bubble_sent_color: string
          chat_bg_color: string
          primary_color: string
          secondary_color: string
          updated_at: string
        }
        Insert: {
          id?: string | null
          accent_color: string
          bubble_received_color: string
          bubble_sent_color: string
          chat_bg_color: string
          primary_color: string
          secondary_color: string
          updated_at?: string
        }
        Update: {
          id?: string | null
          accent_color?: string
          bubble_received_color?: string
          bubble_sent_color?: string
          chat_bg_color?: string
          primary_color?: string
          secondary_color?: string
          updated_at?: string
        }
      }
      drafts: {
        Row: {
          id: string | null
          allow_substitutes: boolean
          champion_prize_pct: number
          cooldown_until: string | null
          country_id: string
          creator_user_id: string
          entry_cost_credits: number
          federation_id: string | null
          format: string
          game_id: string
          invite_code: string | null
          is_private: boolean
          mode: string
          name: string
          players_per_team: number
          real_prize_description: string
          status: string
          subs_per_team: number
          teams_count: number
          total_slots: number
          tournament_id: string | null
          trophy_id: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          allow_substitutes: boolean
          champion_prize_pct: number
          cooldown_until?: string | null
          country_id: string
          creator_user_id: string
          entry_cost_credits: number
          federation_id?: string | null
          format: string
          game_id: string
          invite_code?: string | null
          is_private: boolean
          mode: string
          name: string
          players_per_team: number
          real_prize_description: string
          status: string
          subs_per_team: number
          teams_count: number
          total_slots: number
          tournament_id?: string | null
          trophy_id?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          allow_substitutes?: boolean
          champion_prize_pct?: number
          cooldown_until?: string | null
          country_id?: string
          creator_user_id?: string
          entry_cost_credits?: number
          federation_id?: string | null
          format?: string
          game_id?: string
          invite_code?: string | null
          is_private?: boolean
          mode?: string
          name?: string
          players_per_team?: number
          real_prize_description?: string
          status?: string
          subs_per_team?: number
          teams_count?: number
          total_slots?: number
          tournament_id?: string | null
          trophy_id?: string | null
          updated_at?: string
          created_at?: string
        }
      }
      draft_plan_limits: {
        Row: {
          id: string | null
          can_create_private: boolean
          can_use_custom_team_names: boolean
          can_use_premium_trophy: boolean
          can_view_stats: boolean
          creator_share_pct: number
          default_entry_cost_credits: number
          max_active_drafts: number
          max_players_per_draft: number
          max_teams_per_draft: number
          plan_key: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          can_create_private: boolean
          can_use_custom_team_names: boolean
          can_use_premium_trophy: boolean
          can_view_stats: boolean
          creator_share_pct: number
          default_entry_cost_credits: number
          max_active_drafts: number
          max_players_per_draft: number
          max_teams_per_draft: number
          plan_key: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          can_create_private?: boolean
          can_use_custom_team_names?: boolean
          can_use_premium_trophy?: boolean
          can_view_stats?: boolean
          creator_share_pct?: number
          default_entry_cost_credits?: number
          max_active_drafts?: number
          max_players_per_draft?: number
          max_teams_per_draft?: number
          plan_key?: string
          updated_at?: string
          created_at?: string
        }
      }
      user_easy_leagues: {
        Row: {
          id: string | null
          banner_object_key: string | null
          logo_object_key: string | null
          name: string
          slug: string
          theme_template: string
          user_id: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          banner_object_key?: string | null
          logo_object_key?: string | null
          name: string
          slug: string
          theme_template: string
          user_id: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          banner_object_key?: string | null
          logo_object_key?: string | null
          name?: string
          slug?: string
          theme_template?: string
          user_id?: string
          updated_at?: string
          created_at?: string
        }
      }
      easy_tournament_settings: {
        Row: {
          id: string | null
          allow_custom_teams: boolean
          allow_groups: boolean
          allow_md5: boolean
          allow_platform_teams: boolean
          max_active_tournaments_pro: number
          max_active_tournaments_ultra: number
          max_teams_pro: number
          max_teams_ultra: number
          min_plan_required: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          allow_custom_teams: boolean
          allow_groups: boolean
          allow_md5: boolean
          allow_platform_teams: boolean
          max_active_tournaments_pro: number
          max_active_tournaments_ultra: number
          max_teams_pro: number
          max_teams_ultra: number
          min_plan_required: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          allow_custom_teams?: boolean
          allow_groups?: boolean
          allow_md5?: boolean
          allow_platform_teams?: boolean
          max_active_tournaments_pro?: number
          max_active_tournaments_ultra?: number
          max_teams_pro?: number
          max_teams_ultra?: number
          min_plan_required?: string
          updated_at?: string
          created_at?: string
        }
      }
      easy_tournament_allowed_games: {
        Row: {
          id: string | null
          game_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          game_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          game_id?: string
          created_at?: string
        }
      }
      player_card_gallery: {
        Row: {
          id: string | null
          image_object_key: string
          is_ai_generated: boolean
          label: string
          player_profile_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          image_object_key: string
          is_ai_generated: boolean
          label: string
          player_profile_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          image_object_key?: string
          is_ai_generated?: boolean
          label?: string
          player_profile_id?: string
          user_id?: string
          created_at?: string
        }
      }
      player_templates: {
        Row: {
          id: string | null
          credit_price: string | null
          description: string
          featured: boolean
          is_active: boolean
          is_exclusive_ultra: boolean
          is_premium: boolean
          name: string
          plan_required: string
          preview_image_key: string | null
          slug: string
          sort_order: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          credit_price?: string | null
          description: string
          featured: boolean
          is_active: boolean
          is_exclusive_ultra: boolean
          is_premium: boolean
          name: string
          plan_required: string
          preview_image_key?: string | null
          slug: string
          sort_order: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          credit_price?: string | null
          description?: string
          featured?: boolean
          is_active?: boolean
          is_exclusive_ultra?: boolean
          is_premium?: boolean
          name?: string
          plan_required?: string
          preview_image_key?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
          created_at?: string
        }
      }
      player_imported_stats: {
        Row: {
          id: string | null
          avg_rating: number
          imported_at: string
          imported_by: string
          player_profile_id: string
          season_id: string
          total_assists: number
          total_goals: number
          total_matches: number
          total_mvp: number
        }
        Insert: {
          id?: string | null
          avg_rating: number
          imported_at: string
          imported_by: string
          player_profile_id: string
          season_id: string
          total_assists: number
          total_goals: number
          total_matches: number
          total_mvp: number
        }
        Update: {
          id?: string | null
          avg_rating?: number
          imported_at?: string
          imported_by?: string
          player_profile_id?: string
          season_id?: string
          total_assists?: number
          total_goals?: number
          total_matches?: number
          total_mvp?: number
        }
      }
      national_teams: {
        Row: {
          id: string | null
          country_id: string
          federation_id: string
          game_id: string
          logo_url: string | null
          name: string
          short_name: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          country_id: string
          federation_id: string
          game_id: string
          logo_url?: string | null
          name: string
          short_name: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          country_id?: string
          federation_id?: string
          game_id?: string
          logo_url?: string | null
          name?: string
          short_name?: string
          updated_at?: string
          created_at?: string
        }
      }
      national_team_players: {
        Row: {
          id: string | null
          called_up_at: string
          called_up_by: string
          national_team_id: string
          player_profile_id: string
          position: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string | null
          called_up_at: string
          called_up_by: string
          national_team_id: string
          player_profile_id: string
          position?: string | null
          status: string
          created_at?: string
        }
        Update: {
          id?: string | null
          called_up_at?: string
          called_up_by?: string
          national_team_id?: string
          player_profile_id?: string
          position?: string | null
          status?: string
          created_at?: string
        }
      }
      org_templates: {
        Row: {
          id: string | null
          credit_price: string | null
          description: string
          featured: boolean
          is_active: boolean
          is_exclusive_ultra: boolean
          is_premium: boolean
          name: string
          plan_required: string
          preview_image_key: string | null
          slug: string
          sort_order: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          credit_price?: string | null
          description: string
          featured: boolean
          is_active: boolean
          is_exclusive_ultra: boolean
          is_premium: boolean
          name: string
          plan_required: string
          preview_image_key?: string | null
          slug: string
          sort_order: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          credit_price?: string | null
          description?: string
          featured?: boolean
          is_active?: boolean
          is_exclusive_ultra?: boolean
          is_premium?: boolean
          name?: string
          plan_required?: string
          preview_image_key?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
          created_at?: string
        }
      }
      org_template_assignments: {
        Row: {
          forced_by_user_id: string | null
          is_forced: boolean
          org_id: string
          template_id: string
          updated_at: string
        }
        Insert: {
          forced_by_user_id?: string | null
          is_forced: boolean
          org_id: string
          template_id: string
          updated_at?: string
        }
        Update: {
          forced_by_user_id?: string | null
          is_forced?: boolean
          org_id?: string
          template_id?: string
          updated_at?: string
        }
      }
      org_ranking_config: {
        Row: {
          id: string | null
          entity_type: string
          federation_id: string
          game_id: string
          is_active: boolean
          show_assists: boolean
          show_damage: boolean
          show_draws: boolean
          show_fastest_laps: boolean
          show_goals: boolean
          show_headshots: boolean
          show_kills: boolean
          show_losses: boolean
          show_mvp: boolean
          show_podiums: boolean
          show_poles: boolean
          show_race_points: boolean
          show_rating: boolean
          show_sh_assists: boolean
          show_wins: boolean
          weight_assists: number
          weight_damage: number
          weight_draws: number
          weight_fastest_laps: number
          weight_goals: number
          weight_headshots: number
          weight_kills: number
          weight_losses: number
          weight_mvp: number
          weight_podiums: number
          weight_poles: number
          weight_race_points: number
          weight_rating: number
          weight_sh_assists: number
          weight_wins: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          entity_type: string
          federation_id: string
          game_id: string
          is_active: boolean
          show_assists: boolean
          show_damage: boolean
          show_draws: boolean
          show_fastest_laps: boolean
          show_goals: boolean
          show_headshots: boolean
          show_kills: boolean
          show_losses: boolean
          show_mvp: boolean
          show_podiums: boolean
          show_poles: boolean
          show_race_points: boolean
          show_rating: boolean
          show_sh_assists: boolean
          show_wins: boolean
          weight_assists: number
          weight_damage: number
          weight_draws: number
          weight_fastest_laps: number
          weight_goals: number
          weight_headshots: number
          weight_kills: number
          weight_losses: number
          weight_mvp: number
          weight_podiums: number
          weight_poles: number
          weight_race_points: number
          weight_rating: number
          weight_sh_assists: number
          weight_wins: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          entity_type?: string
          federation_id?: string
          game_id?: string
          is_active?: boolean
          show_assists?: boolean
          show_damage?: boolean
          show_draws?: boolean
          show_fastest_laps?: boolean
          show_goals?: boolean
          show_headshots?: boolean
          show_kills?: boolean
          show_losses?: boolean
          show_mvp?: boolean
          show_podiums?: boolean
          show_poles?: boolean
          show_race_points?: boolean
          show_rating?: boolean
          show_sh_assists?: boolean
          show_wins?: boolean
          weight_assists?: number
          weight_damage?: number
          weight_draws?: number
          weight_fastest_laps?: number
          weight_goals?: number
          weight_headshots?: number
          weight_kills?: number
          weight_losses?: number
          weight_mvp?: number
          weight_podiums?: number
          weight_poles?: number
          weight_race_points?: number
          weight_rating?: number
          weight_sh_assists?: number
          weight_wins?: number
          updated_at?: string
          created_at?: string
        }
      }
      social_templates: {
        Row: {
          id: string | null
          active: boolean
          background_image: string
          category: string
          font_family: string
          name: string
          overlay_opacity: number
          primary_color: string
          secondary_color: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          active: boolean
          background_image: string
          category: string
          font_family: string
          name: string
          overlay_opacity: number
          primary_color: string
          secondary_color: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          active?: boolean
          background_image?: string
          category?: string
          font_family?: string
          name?: string
          overlay_opacity?: number
          primary_color?: string
          secondary_color?: string
          updated_at?: string
          created_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string | null
          key: string
          value: any
          updated_at: string
        }
        Insert: {
          id?: string | null
          key: string
          value: any
          updated_at?: string
        }
        Update: {
          id?: string | null
          key?: string
          value?: any
          updated_at?: string
        }
      }
      site_feature_flags: {
        Row: {
          id: string | null
          entity_type: string | null
          feature_group: string
          feature_key: string
          feature_label: string
          visible: boolean
          updated_at: string
        }
        Insert: {
          id?: string | null
          entity_type?: string | null
          feature_group: string
          feature_key: string
          feature_label: string
          visible: boolean
          updated_at?: string
        }
        Update: {
          id?: string | null
          entity_type?: string | null
          feature_group?: string
          feature_key?: string
          feature_label?: string
          visible?: boolean
          updated_at?: string
        }
      }
      signup_wizard_field_config: {
        Row: {
          id: string | null
          field_key: string
          field_label: string
          game_id: string
          is_required: boolean
          is_visible: boolean
          sort_order: number
          step_key: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          field_key: string
          field_label: string
          game_id: string
          is_required: boolean
          is_visible: boolean
          sort_order: number
          step_key: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          field_key?: string
          field_label?: string
          game_id?: string
          is_required?: boolean
          is_visible?: boolean
          sort_order?: number
          step_key?: string
          updated_at?: string
          created_at?: string
        }
      }
      entity_slugs: {
        Row: {
          entity_id: string
          entity_type: string
          slug: string
          created_at: string
        }
        Insert: {
          entity_id: string
          entity_type: string
          slug: string
          created_at?: string
        }
        Update: {
          entity_id?: string
          entity_type?: string
          slug?: string
          created_at?: string
        }
      }
      entity_visual_overrides: {
        Row: {
          id: string | null
          config: any
          entity_id: string
          entity_type: string
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string | null
          config: any
          entity_id: string
          entity_type: string
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string | null
          config?: any
          entity_id?: string
          entity_type?: string
          updated_by?: string | null
          updated_at?: string
        }
      }
      bans: {
        Row: {
          id: string | null
          active: boolean
          banned_by_user_id: string
          ends_at: string | null
          federation_id: string | null
          is_global: boolean
          player_profile_id: string | null
          reason: string
          regulation_id: string | null
          starts_at: string
          target_type: string
          team_id: string | null
          team_scope: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          active: boolean
          banned_by_user_id: string
          ends_at?: string | null
          federation_id?: string | null
          is_global: boolean
          player_profile_id?: string | null
          reason: string
          regulation_id?: string | null
          starts_at: string
          target_type: string
          team_id?: string | null
          team_scope?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          active?: boolean
          banned_by_user_id?: string
          ends_at?: string | null
          federation_id?: string | null
          is_global?: boolean
          player_profile_id?: string | null
          reason?: string
          regulation_id?: string | null
          starts_at?: string
          target_type?: string
          team_id?: string | null
          team_scope?: string | null
          updated_at?: string
          created_at?: string
        }
      }
      regulation_templates: {
        Row: {
          id: string | null
          active: boolean
          category: string
          content: string
          title: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          active: boolean
          category: string
          content: string
          title: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          active?: boolean
          category?: string
          content?: string
          title?: string
          updated_at?: string
          created_at?: string
        }
      }
      performance_achievement_types: {
        Row: {
          id: string | null
          active: boolean
          base_code: string
          code: string
          description: string
          display_label: string
          icon_object_key: string
          name: string
          period_scope: string
          scope: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          active: boolean
          base_code: string
          code: string
          description: string
          display_label: string
          icon_object_key: string
          name: string
          period_scope: string
          scope: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          active?: boolean
          base_code?: string
          code?: string
          description?: string
          display_label?: string
          icon_object_key?: string
          name?: string
          period_scope?: string
          scope?: string
          updated_at?: string
          created_at?: string
        }
      }
      performance_achievement_occurrences: {
        Row: {
          id: string | null
          achieved_at: string
          achievement_type_id: string
          internal_match_id: string
          period_key: string | null
          player_profile_id: string
          source_type: string
          stat_value: number | null
          team_id: string
          tournament_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          achieved_at: string
          achievement_type_id: string
          internal_match_id: string
          period_key?: string | null
          player_profile_id: string
          source_type: string
          stat_value?: number | null
          team_id: string
          tournament_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          achieved_at?: string
          achievement_type_id?: string
          internal_match_id?: string
          period_key?: string | null
          player_profile_id?: string
          source_type?: string
          stat_value?: number | null
          team_id?: string
          tournament_id?: string
          created_at?: string
        }
      }
      performance_achievement_totals: {
        Row: {
          achievement_type_id: string
          period_key: string
          player_profile_id: string
          source_type: string
          total_count: number
          updated_at: string
        }
        Insert: {
          achievement_type_id: string
          period_key: string
          player_profile_id: string
          source_type: string
          total_count: number
          updated_at?: string
        }
        Update: {
          achievement_type_id?: string
          period_key?: string
          player_profile_id?: string
          source_type?: string
          total_count?: number
          updated_at?: string
        }
      }
      manual_titles: {
        Row: {
          id: string | null
          awarded_at: string
          created_by: string
          federation_id: string
          game_id: string | null
          has_roster: boolean
          player_profile_id: string | null
          season_id: string | null
          target_type: string
          team_id: string
          tier_id: string | null
          title_name: string
          tournament_id: string | null
          trophy_image_object_key: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          awarded_at: string
          created_by: string
          federation_id: string
          game_id?: string | null
          has_roster: boolean
          player_profile_id?: string | null
          season_id?: string | null
          target_type: string
          team_id: string
          tier_id?: string | null
          title_name: string
          tournament_id?: string | null
          trophy_image_object_key: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          awarded_at?: string
          created_by?: string
          federation_id?: string
          game_id?: string | null
          has_roster?: boolean
          player_profile_id?: string | null
          season_id?: string | null
          target_type?: string
          team_id?: string
          tier_id?: string | null
          title_name?: string
          tournament_id?: string | null
          trophy_image_object_key?: string
          updated_at?: string
          created_at?: string
        }
      }
      manual_title_roster: {
        Row: {
          id: string | null
          manual_title_id: string
          player_profile_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string | null
          manual_title_id: string
          player_profile_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string | null
          manual_title_id?: string
          player_profile_id?: string
          role?: string
          created_at?: string
        }
      }
      champion_roster_snapshots: {
        Row: {
          id: string | null
          entrant_id: string
          handle: string
          player_profile_id: string
          role: string
          tournament_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          entrant_id: string
          handle: string
          player_profile_id: string
          role: string
          tournament_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          entrant_id?: string
          handle?: string
          player_profile_id?: string
          role?: string
          tournament_id?: string
          created_at?: string
        }
      }
      hero_mascot_settings: {
        Row: {
          id: string | null
          height_px: number
          image_object_key: string | null
          is_visible: boolean
          position: string
          width_px: number
          updated_at: string
        }
        Insert: {
          id?: string | null
          height_px: number
          image_object_key?: string | null
          is_visible: boolean
          position: string
          width_px: number
          updated_at?: string
        }
        Update: {
          id?: string | null
          height_px?: number
          image_object_key?: string | null
          is_visible?: boolean
          position?: string
          width_px?: number
          updated_at?: string
        }
      }
      gallery_albums: {
        Row: {
          id: string | null
          cover_image_key: string | null
          created_by_user_id: string
          federation_id: string
          name: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          cover_image_key?: string | null
          created_by_user_id: string
          federation_id: string
          name: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          cover_image_key?: string | null
          created_by_user_id?: string
          federation_id?: string
          name?: string
          updated_at?: string
          created_at?: string
        }
      }
      friendly_config: {
        Row: {
          id: string | null
          allow_cross_country: boolean
          allowed_formats: any
          cooldown_minutes: number
          enabled: boolean
          max_active_free: number
          max_active_pro: number
          max_active_ultra: number
          updated_at: string
        }
        Insert: {
          id?: string | null
          allow_cross_country: boolean
          allowed_formats: any
          cooldown_minutes: number
          enabled: boolean
          max_active_free: number
          max_active_pro: number
          max_active_ultra: number
          updated_at?: string
        }
        Update: {
          id?: string | null
          allow_cross_country?: boolean
          allowed_formats?: any
          cooldown_minutes?: number
          enabled?: boolean
          max_active_free?: number
          max_active_pro?: number
          max_active_ultra?: number
          updated_at?: string
        }
      }
      friendly_listings: {
        Row: {
          id: string | null
          best_of: number
          country_id: string
          country_restricted: boolean
          creator_stream_url: string | null
          creator_team_id: string | null
          creator_user_id: string
          game_id: string
          is_ranked: boolean
          mode: string
          scheduled_at: string | null
          stake_credits: number
          status: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          best_of: number
          country_id: string
          country_restricted: boolean
          creator_stream_url?: string | null
          creator_team_id?: string | null
          creator_user_id: string
          game_id: string
          is_ranked: boolean
          mode: string
          scheduled_at?: string | null
          stake_credits: number
          status: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          best_of?: number
          country_id?: string
          country_restricted?: boolean
          creator_stream_url?: string | null
          creator_team_id?: string | null
          creator_user_id?: string
          game_id?: string
          is_ranked?: boolean
          mode?: string
          scheduled_at?: string | null
          stake_credits?: number
          status?: string
          updated_at?: string
          created_at?: string
        }
      }
      friendly_matches: {
        Row: {
          id: string | null
          challenger_stream_url: string | null
          challenger_team_id: string | null
          challenger_user_id: string
          conversation_id: string
          creator_stream_url: string | null
          listing_id: string
          reported_at: string
          reported_by_user_id: string
          score_challenger: string | null
          score_creator: string | null
          scores: any
          status: string
          winner_team_id: string | null
          winner_user_id: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          challenger_stream_url?: string | null
          challenger_team_id?: string | null
          challenger_user_id: string
          conversation_id: string
          creator_stream_url?: string | null
          listing_id: string
          reported_at: string
          reported_by_user_id: string
          score_challenger?: string | null
          score_creator?: string | null
          scores: any
          status: string
          winner_team_id?: string | null
          winner_user_id?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          challenger_stream_url?: string | null
          challenger_team_id?: string | null
          challenger_user_id?: string
          conversation_id?: string
          creator_stream_url?: string | null
          listing_id?: string
          reported_at?: string
          reported_by_user_id?: string
          score_challenger?: string | null
          score_creator?: string | null
          scores?: any
          status?: string
          winner_team_id?: string | null
          winner_user_id?: string | null
          updated_at?: string
          created_at?: string
        }
      }
      friendly_betting_config: {
        Row: {
          id: string | null
          allow_in_casual: boolean
          allow_in_ranked: boolean
          enabled: boolean
          house_fee_percent: number
          max_stake: number
          min_stake: number
          stake_matchmaking_mode: string
          stake_tolerance_percent: number
          updated_at: string
        }
        Insert: {
          id?: string | null
          allow_in_casual: boolean
          allow_in_ranked: boolean
          enabled: boolean
          house_fee_percent: number
          max_stake: number
          min_stake: number
          stake_matchmaking_mode: string
          stake_tolerance_percent: number
          updated_at?: string
        }
        Update: {
          id?: string | null
          allow_in_casual?: boolean
          allow_in_ranked?: boolean
          enabled?: boolean
          house_fee_percent?: number
          max_stake?: number
          min_stake?: number
          stake_matchmaking_mode?: string
          stake_tolerance_percent?: number
          updated_at?: string
        }
      }
      eafc_newgen_matches: {
        Row: {
          away_assists: number
          away_club_id: number
          away_club_name: string
          away_goals: number
          away_pass_attempts: number
          away_passes_made: number
          away_rating_sum: number
          away_result: number
          away_saves: number
          away_shots: number
          away_tackle_attempts: number
          away_tackles_made: number
          home_assists: number
          home_club_id: number
          home_club_name: string
          home_goals: number
          home_pass_attempts: number
          home_passes_made: number
          home_rating_sum: number
          home_result: number
          home_saves: number
          home_shots: number
          home_tackle_attempts: number
          home_tackles_made: number
          match_date: string
          match_id: number
          match_timestamp: number
          match_type: string
          platform: string
          raw_json: any
          time_ago_number: number
          time_ago_unit: string
          created_at: string
        }
        Insert: {
          away_assists: number
          away_club_id: number
          away_club_name: string
          away_goals: number
          away_pass_attempts: number
          away_passes_made: number
          away_rating_sum: number
          away_result: number
          away_saves: number
          away_shots: number
          away_tackle_attempts: number
          away_tackles_made: number
          home_assists: number
          home_club_id: number
          home_club_name: string
          home_goals: number
          home_pass_attempts: number
          home_passes_made: number
          home_rating_sum: number
          home_result: number
          home_saves: number
          home_shots: number
          home_tackle_attempts: number
          home_tackles_made: number
          match_date: string
          match_id: number
          match_timestamp: number
          match_type: string
          platform: string
          raw_json: any
          time_ago_number: number
          time_ago_unit: string
          created_at?: string
        }
        Update: {
          away_assists?: number
          away_club_id?: number
          away_club_name?: string
          away_goals?: number
          away_pass_attempts?: number
          away_passes_made?: number
          away_rating_sum?: number
          away_result?: number
          away_saves?: number
          away_shots?: number
          away_tackle_attempts?: number
          away_tackles_made?: number
          home_assists?: number
          home_club_id?: number
          home_club_name?: string
          home_goals?: number
          home_pass_attempts?: number
          home_passes_made?: number
          home_rating_sum?: number
          home_result?: number
          home_saves?: number
          home_shots?: number
          home_tackle_attempts?: number
          home_tackles_made?: number
          match_date?: string
          match_id?: number
          match_timestamp?: number
          match_type?: string
          platform?: string
          raw_json?: any
          time_ago_number?: number
          time_ago_unit?: string
          created_at?: string
        }
      }
      eafc_newgen_player_positions: {
        Row: {
          code_ale: string | null
          code_en: string | null
          code_es: string | null
          code_fr: string | null
          code_ita: string | null
          code_pt: string | null
          code_ptbr: string
          codes_ale: any
          codes_en: any
          codes_es: any
          codes_fr: any
          codes_ita: any
          codes_pt: any
          codes_ptbr: any
          label_ale: string
          label_en: string
          label_es: string
          label_fr: string
          label_ita: string
          label_pt: string
          label_ptbr: string
          notes: string | null
          position_id: number
          created_at: string
        }
        Insert: {
          code_ale?: string | null
          code_en?: string | null
          code_es?: string | null
          code_fr?: string | null
          code_ita?: string | null
          code_pt?: string | null
          code_ptbr: string
          codes_ale: any
          codes_en: any
          codes_es: any
          codes_fr: any
          codes_ita: any
          codes_pt: any
          codes_ptbr: any
          label_ale: string
          label_en: string
          label_es: string
          label_fr: string
          label_ita: string
          label_pt: string
          label_ptbr: string
          notes?: string | null
          position_id: number
          created_at?: string
        }
        Update: {
          code_ale?: string | null
          code_en?: string | null
          code_es?: string | null
          code_fr?: string | null
          code_ita?: string | null
          code_pt?: string | null
          code_ptbr?: string
          codes_ale?: any
          codes_en?: any
          codes_es?: any
          codes_fr?: any
          codes_ita?: any
          codes_pt?: any
          codes_ptbr?: any
          label_ale?: string
          label_en?: string
          label_es?: string
          label_fr?: string
          label_ita?: string
          label_pt?: string
          label_ptbr?: string
          notes?: string | null
          position_id?: number
          created_at?: string
        }
      }
      ecosystem_game_cards: {
        Row: {
          id: string | null
          game_ids: any
          glow_color: string
          image_url: string
          is_active: boolean
          sort_order: number
          subtitle: string
          title: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          game_ids: any
          glow_color: string
          image_url: string
          is_active: boolean
          sort_order: number
          subtitle: string
          title: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          game_ids?: any
          glow_color?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          subtitle?: string
          title?: string
          updated_at?: string
          created_at?: string
        }
      }
      profile_template_assignments: {
        Row: {
          id: string | null
          assigned_by: string
          entity_id: string
          entity_type: string
          forced_by_user_id: string | null
          is_forced: boolean
          template_id: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          assigned_by: string
          entity_id: string
          entity_type: string
          forced_by_user_id?: string | null
          is_forced: boolean
          template_id: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          assigned_by?: string
          entity_id?: string
          entity_type?: string
          forced_by_user_id?: string | null
          is_forced?: boolean
          template_id?: string
          updated_at?: string
          created_at?: string
        }
      }
      style_market_stats: {
        Row: {
          avg_recent_price: number
          current_supply: number
          floor_price: number
          last_sale_at: string | null
          last_sale_price: number
          max_supply: number
          sales_30d: number
          style_key: string
        }
        Insert: {
          avg_recent_price: number
          current_supply: number
          floor_price: number
          last_sale_at?: string | null
          last_sale_price: number
          max_supply: number
          sales_30d: number
          style_key: string
        }
        Update: {
          avg_recent_price?: number
          current_supply?: number
          floor_price?: number
          last_sale_at?: string | null
          last_sale_price?: number
          max_supply?: number
          sales_30d?: number
          style_key?: string
        }
      }
      team_selection_weights: {
        Row: {
          id: string | null
          setting_id: string
          stat_type: string
          weight: number
        }
        Insert: {
          id?: string | null
          setting_id: string
          stat_type: string
          weight: number
        }
        Update: {
          id?: string | null
          setting_id?: string
          stat_type?: string
          weight?: number
        }
      }
      team_selections_results: {
        Row: {
          id: string | null
          formation_key: string
          generated_at: string
          image_url: string | null
          is_published: boolean
          period_end: string
          period_start: string
          players: any
          round_label: string
          setting_id: string
          slot_custom_positions: any | null
          tournament_id: string
          created_at: string
        }
        Insert: {
          id?: string | null
          formation_key: string
          generated_at: string
          image_url?: string | null
          is_published: boolean
          period_end: string
          period_start: string
          players: any
          round_label: string
          setting_id: string
          slot_custom_positions?: any | null
          tournament_id: string
          created_at?: string
        }
        Update: {
          id?: string | null
          formation_key?: string
          generated_at?: string
          image_url?: string | null
          is_published?: boolean
          period_end?: string
          period_start?: string
          players?: any
          round_label?: string
          setting_id?: string
          slot_custom_positions?: any | null
          tournament_id?: string
          created_at?: string
        }
      }
      team_selections_settings: {
        Row: {
          id: string | null
          auto_frequency: string | null
          card_height: number
          card_width: number
          end_date: string | null
          formation_key: string
          is_active: boolean
          is_automatic: boolean
          is_default: boolean
          min_matches: number
          min_minutes: number
          name: string
          pitch_aspect_ratio: string
          pitch_bg_color: string
          pitch_border_color: string
          pitch_image_url: string
          pitch_line_color: string
          pitch_width: number
          selection_card_fields_override: any
          show_pitch_lines: boolean
          slot_custom_positions: any | null
          slot_position_map: any
          start_date: string | null
          tournament_id: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string | null
          auto_frequency?: string | null
          card_height: number
          card_width: number
          end_date?: string | null
          formation_key: string
          is_active: boolean
          is_automatic: boolean
          is_default: boolean
          min_matches: number
          min_minutes: number
          name: string
          pitch_aspect_ratio: string
          pitch_bg_color: string
          pitch_border_color: string
          pitch_image_url: string
          pitch_line_color: string
          pitch_width: number
          selection_card_fields_override: any
          show_pitch_lines: boolean
          slot_custom_positions?: any | null
          slot_position_map: any
          start_date?: string | null
          tournament_id: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string | null
          auto_frequency?: string | null
          card_height?: number
          card_width?: number
          end_date?: string | null
          formation_key?: string
          is_active?: boolean
          is_automatic?: boolean
          is_default?: boolean
          min_matches?: number
          min_minutes?: number
          name?: string
          pitch_aspect_ratio?: string
          pitch_bg_color?: string
          pitch_border_color?: string
          pitch_image_url?: string
          pitch_line_color?: string
          pitch_width?: number
          selection_card_fields_override?: any
          show_pitch_lines?: boolean
          slot_custom_positions?: any | null
          slot_position_map?: any
          start_date?: string | null
          tournament_id?: string
          updated_at?: string
          created_at?: string
        }
      }
      plan_credit_config: {
        Row: {
          id: string | null
          monthly_credits: number
          plan_key: string
          rollover_enabled: boolean
          rollover_max: number
          weekly_bonus_credits: number
          weekly_usage_threshold: number
          updated_at: string
        }
        Insert: {
          id?: string | null
          monthly_credits: number
          plan_key: string
          rollover_enabled: boolean
          rollover_max: number
          weekly_bonus_credits: number
          weekly_usage_threshold: number
          updated_at?: string
        }
        Update: {
          id?: string | null
          monthly_credits?: number
          plan_key?: string
          rollover_enabled?: boolean
          rollover_max?: number
          weekly_bonus_credits?: number
          weekly_usage_threshold?: number
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
