/**
 * WordPress Dependencies
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { RawHTML } from '@wordpress/element';
import { format, dateI18n, getSettings } from '@wordpress/date';
import {
	PanelBody,
	ToggleControl,
	SelectControl,
	QueryControls,
} from '@wordpress/components';

/**
 * Internal Dependencies
 */
import metadata from './block.json';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const {
		numberOfPosts,
		numberOfColumns,
		displayFeaturedImage,
		postOrder,
		postOrderBy,
		selectedCategories,
		isLinkedToPost,
	} = attributes;

	const currentlySelectedCategoryIds =
		selectedCategories && selectedCategories.length > 0
			? selectedCategories.map( ( cat ) => cat.id )
			: [];

	const posts = useSelect(
		( select ) => {
			return select( 'core' ).getEntityRecords( 'postType', 'post', {
				per_page: numberOfPosts,
				_embed: true,
				order: postOrder,
				orderby: postOrderBy,
				categories: currentlySelectedCategoryIds,
			} );
		},
		[
			numberOfPosts,
			postOrderBy,
			postOrder,
			selectedCategories,
			isLinkedToPost,
		]
	);

	const allCategories = useSelect( ( select ) => {
		return select( 'core' ).getEntityRecords( 'taxonomy', 'category', {
			per_page: -1,
		} );
	}, [] );

	const categorySuggestions = {};
	if ( allCategories ) {
		for ( let i = 0; i < allCategories.length; i++ ) {
			const cat = allCategories[ i ];
			categorySuggestions[ cat.name ] = cat;
		}
	}

	const toggleDisplayFeaturedImage = () => {
		setAttributes( {
			displayFeaturedImage: ! displayFeaturedImage,
		} );
	};

	const toggleIsLinkedToPost = () => {
		setAttributes( { isLinkedToPost: ! isLinkedToPost } );
	};

	const onNumberOfItemsChange = ( value ) => {
		setAttributes( {
			numberOfPosts: value,
		} );
	};

	const onCategoryChange = ( values ) => {
		const hasNoSuggestions = values.some(
			( value ) =>
				typeof value === 'string' && ! categorySuggestions[ value ]
		);
		if ( hasNoSuggestions ) return;

		const updatedCategories = values.map( ( item ) => {
			return typeof item === 'string'
				? categorySuggestions[ item ]
				: item;
		} );

		setAttributes( {
			selectedCategories: updatedCategories,
		} );
	};

	const blockProps = useBlockProps( {
		className: `columns-${ numberOfColumns }`,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody>
					<ToggleControl
						label={ __(
							'Link Title to Post',
							metadata.textdomain
						) }
						checked={ isLinkedToPost }
						onChange={ toggleIsLinkedToPost }
					/>
					<ToggleControl
						label={ __(
							'Display Featured Image',
							metadata.textdomain
						) }
						checked={ displayFeaturedImage }
						onChange={ toggleDisplayFeaturedImage }
					/>
					<SelectControl
						label="Number of Columns"
						value={ numberOfColumns }
						options={ [
							{ label: 'One columns', value: '1' },
							{ label: 'Two columns', value: '2' },
							{ label: 'Three columns', value: '3' },
						] }
						onChange={ ( numberOfColumns ) =>
							setAttributes( { numberOfColumns } )
						}
						__nextHasNoMarginBottom
					/>

					<QueryControls
						numberOfItems={ numberOfPosts }
						onNumberOfItemsChange={ onNumberOfItemsChange }
						maxItems={ 12 }
						minItems={ 2 }
						orderBy={ postOrderBy }
						onOrderByChange={ ( value ) => {
							setAttributes( {
								postOrderBy: value,
							} );
						} }
						order={ postOrder }
						onOrderChange={ ( val ) => {
							setAttributes( {
								postOrder: val,
							} );
						} }
						categorySuggestions={ categorySuggestions }
						selectedCategories={ selectedCategories }
						onCategoryChange={ onCategoryChange }
					/>
				</PanelBody>
			</InspectorControls>

			<ul { ...blockProps }>
				{ posts &&
					posts.map( ( post ) => {
						const featuredImage =
							post._embedded &&
							post._embedded[ 'wp:featuredmedia' ] &&
							post._embedded[ 'wp:featuredmedia' ].length &&
							post._embedded[ 'wp:featuredmedia' ][ 0 ]
								.media_details &&
							post._embedded[ 'wp:featuredmedia' ][ 0 ]
								.media_details.sizes &&
							post._embedded[ 'wp:featuredmedia' ][ 0 ]
								.media_details.sizes.thumbnail &&
							post._embedded[ 'wp:featuredmedia' ][ 0 ];

						const title = post.title.rendered
							? post.title.rendered
							: 'no title';

						return (
							<li key={ post.id }>
								<h3>
									{ isLinkedToPost ? (
										<a href={ post.link }>
											<RawHTML>{ title }</RawHTML>
										</a>
									) : (
										<RawHTML>{ title }</RawHTML>
									) }
								</h3>

								{ post.date && (
									<time dateTime={ format( 'c', post.date ) }>
										{ dateI18n(
											getSettings().formats.date,
											post.date
										) }
									</time>
								) }
								{ displayFeaturedImage && featuredImage && (
									<img
										src={
											featuredImage.media_details.sizes
												.thumbnail.source_url
										}
										alt={ featuredImage.alt_text }
									/>
								) }
								{ post.excerpt.rendered ? (
									<RawHTML>{ post.excerpt.rendered }</RawHTML>
								) : (
									''
								) }
							</li>
						);
					} ) }
			</ul>
		</>
	);
}
